import assert from 'node:assert';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { app, JWT_SECRET } from '../server';

const TEST_PORT = 3456;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let server: http.Server;

async function request(endpoint: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

async function runTests() {
  console.log('--- KHỞI ĐỘNG BỘ KIỂM THỬ BẢO MẬT & XÁC THỰC PHUANH SNEAKER ---\n');

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`[Test Server] Đang lắng nghe tại cổng ${TEST_PORT}\n`);
      resolve();
    });
  });

  let passedTests = 0;
  let totalTests = 0;

  async function test(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Token giả và token hết hạn bị từ chối (401)
    // -------------------------------------------------------------
    await test('1.1 Token giả không có chữ ký hợp lệ bị từ chối (401)', async () => {
      const res = await request('/api/auth/me', {
        headers: { Authorization: 'Bearer this_is_a_completely_fake_token_random_string' },
      });
      assert.strictEqual(res.status, 401, 'Token giả phải bị từ chối với 401');
      assert.ok(res.data?.error?.message, 'Phải có thông báo lỗi');
    });

    await test('1.2 Token bị giả mạo với secret khác hoặc algorithm none bị từ chối (401)', async () => {
      const forgedToken = jwt.sign(
        { sub: 'user_admin_phuanh', role: 'ADMIN', jti: 'fake_jti_123' },
        'wrong_attacker_secret_key_1234567890',
        { algorithm: 'HS256', issuer: 'phuanh-sneaker-api', audience: 'phuanh-sneaker-client' }
      );
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${forgedToken}` },
      });
      assert.strictEqual(res.status, 401, 'Token giả mạo secret phải trả về 401');
    });

    await test('1.3 Token hết hạn bị từ chối (401)', async () => {
      const expiredToken = jwt.sign(
        { sub: 'user_admin_phuanh', role: 'ADMIN', jti: 'expired_jti_123' },
        JWT_SECRET,
        { algorithm: 'HS256', issuer: 'phuanh-sneaker-api', audience: 'phuanh-sneaker-client', expiresIn: -10 }
      );
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      assert.strictEqual(res.status, 401, 'Token hết hạn phải trả về 401');
      assert.match(res.data?.error?.message || '', /hết hạn/i, 'Thông báo phải ghi rõ token hết hạn');
    });

    // -------------------------------------------------------------
    // TEST 2: Không đăng nhập thì không thể gọi API quản trị (401)
    // -------------------------------------------------------------
    await test('2.1 Không đăng nhập gọi GET /api/admin/dashboard bị từ chối (401)', async () => {
      const res = await request('/api/admin/dashboard');
      assert.strictEqual(res.status, 401, 'Không có token gọi admin dashboard phải bị 401');
    });

    await test('2.2 Không đăng nhập gọi POST /api/products bị từ chối (401)', async () => {
      const res = await request('/api/products', {
        method: 'POST',
        body: { name: 'Giày Hack', category: 'NIKE', priceValue: 100000, sku: 'HACK01' },
      });
      assert.strictEqual(res.status, 401, 'Không có token tạo sản phẩm phải bị 401');
    });

    await test('2.3 Không đăng nhập gọi PUT /api/admin/settings bị từ chối (401)', async () => {
      const res = await request('/api/admin/settings', {
        method: 'PUT',
        body: { hotline: '0000000000' },
      });
      assert.strictEqual(res.status, 401, 'Không có token cập nhật settings phải bị 401');
    });

    // -------------------------------------------------------------
    // TEST 3: Tài khoản khách hàng không thể thực hiện thao tác admin (403)
    // -------------------------------------------------------------
    const customerLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@gmail.com', password: 'Customer@123' },
    });
    assert.strictEqual(customerLoginRes.status, 200, 'Đăng nhập khách hàng phải thành công');
    const customerToken = customerLoginRes.data.token;

    await test('3.1 Khách hàng gọi GET /api/admin/dashboard bị từ chối (403)', async () => {
      const res = await request('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.strictEqual(res.status, 403, 'Khách hàng gọi admin dashboard phải bị 403');
      assert.match(res.data?.error?.message || '', /quản trị viên/i);
    });

    await test('3.2 Khách hàng gọi POST /api/products bị từ chối (403)', async () => {
      const res = await request('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${customerToken}` },
        body: { name: 'Giày Khách Tạo', category: 'NIKE', priceValue: 200000, sku: 'CUST01' },
      });
      assert.strictEqual(res.status, 403, 'Khách hàng tạo sản phẩm phải bị 403');
    });

    await test('3.3 Khách hàng gọi POST /api/inventory/adjust bị từ chối (403)', async () => {
      const res = await request('/api/inventory/adjust', {
        method: 'POST',
        headers: { Authorization: `Bearer ${customerToken}` },
        body: { productId: 81265049, size: '39', quantityDelta: 100, reason: 'hack' },
      });
      assert.strictEqual(res.status, 403, 'Khách hàng điều chỉnh kho phải bị 403');
    });

    // -------------------------------------------------------------
    // TEST 4: Khách A không thể xem hoặc sửa đơn của khách B (403)
    // -------------------------------------------------------------
    // Đăng ký Khách A
    const userARes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Khách Hàng A',
        email: `customera_${Date.now()}@test.com`,
        password: 'PasswordA123',
        phone: '0911111111',
      },
    });
    assert.strictEqual(userARes.status, 201);
    const tokenA = userARes.data.token;

    // Đăng ký Khách B
    const userBRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Khách Hàng B',
        email: `customerb_${Date.now()}@test.com`,
        password: 'PasswordB123',
        phone: '0922222222',
      },
    });
    assert.strictEqual(userBRes.status, 201);
    const tokenB = userBRes.data.token;

    // Khách B tạo một đơn hàng
    const orderBRes = await request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: {
        customer: { fullName: 'Khách B', phone: '0922222222', address: '123 Đường B' },
        items: [
          {
            id: 81265049,
            alias: 'cortez-1985-do',
            name: 'cortez 1985 đỏ',
            category: 'NIKE',
            image: 'https://bizweb.dktcdn.net/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg',
            price: '460.000₫',
            priceValue: 460000,
            size: '39',
            quantity: 1,
          },
        ],
        payment: 'cod',
      },
    });
    assert.strictEqual(orderBRes.status, 201);
    const orderBId = orderBRes.data.order.id;

    await test('4.1 Khách A cố tình xem đơn hàng của Khách B bị từ chối (403)', async () => {
      const res = await request(`/api/orders/${orderBId}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      assert.strictEqual(res.status, 403, 'Khách A không được phép xem đơn của Khách B');
    });

    await test('4.2 Khách A cố tình cập nhật/hủy đơn của Khách B bị từ chối (403)', async () => {
      const res = await request(`/api/orders/${orderBId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { status: 'cancelled' },
      });
      assert.strictEqual(res.status, 403, 'Khách A không được phép sửa đơn của Khách B');
    });

    await test('4.3 Danh sách đơn của Khách A không chứa đơn của Khách B', async () => {
      const res = await request('/api/orders', {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      assert.strictEqual(res.status, 200);
      const orders = res.data.orders as any[];
      const containsOrderB = orders.some((o) => o.id === orderBId);
      assert.strictEqual(containsOrderB, false, 'Đơn của Khách B không được hiển thị cho Khách A');
    });

    // -------------------------------------------------------------
    // TEST 5: Không thể tự sửa hoặc leo thang role thành admin
    // -------------------------------------------------------------
    await test('5.1 Không thể tự gán role: ADMIN khi đăng ký tài khoản', async () => {
      const hackerRes = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Kẻ Tấn Công',
          email: `hacker_${Date.now()}@evil.com`,
          password: 'PasswordHack123',
          role: 'ADMIN', // Cố tình truyền role ADMIN
        },
      });
      assert.strictEqual(hackerRes.status, 201);
      assert.strictEqual(hackerRes.data.user.role, 'CUSTOMER', 'Role phải bị ép về CUSTOMER');
    });

    await test('5.2 Không thể sửa role thành ADMIN qua PUT /api/auth/profile', async () => {
      const profileRes = await request('/api/auth/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { role: 'ADMIN', name: 'Khách A Đã Đổi Tên' },
      });
      assert.strictEqual(profileRes.status, 200);
      assert.strictEqual(profileRes.data.user.role, 'CUSTOMER', 'Role vẫn phải là CUSTOMER');
    });

    // -------------------------------------------------------------
    // TEST 6: Rate limiting có tác dụng chống Brute Force
    // -------------------------------------------------------------
    await test('6.1 Đăng nhập sai liên tiếp 5 lần kích hoạt rate limiting (429)', async () => {
      const targetEmail = `brute_target_${Date.now()}@test.com`;

      // 5 lần thử sai
      for (let i = 0; i < 5; i++) {
        const failRes = await request('/api/auth/login', {
          method: 'POST',
          body: { email: targetEmail, password: 'WrongPassword123' },
        });
        assert.strictEqual(failRes.status, 401, `Lần thử ${i + 1} phải trả về 401`);
        assert.strictEqual(
          failRes.data.error.message,
          'Email hoặc mật khẩu không chính xác',
          'Lỗi không được tiết lộ tài khoản có tồn tại hay không'
        );
      }

      // Lần thử thứ 6 phải bị khóa với mã 429
      const lockedRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: targetEmail, password: 'WrongPassword123' },
      });
      assert.strictEqual(lockedRes.status, 429, 'Lần thử thứ 6 phải trả về 429 Too Many Requests');
      assert.match(lockedRes.data?.error?.message || '', /15 phút/i);
    });

    // -------------------------------------------------------------
    // TEST 7: Đăng xuất làm mất hiệu lực phiên (Session Revocation)
    // -------------------------------------------------------------
    await test('7.1 Đăng xuất thu hồi phiên, token cũ ngay lập tức bị từ chối (401)', async () => {
      // Đăng nhập lấy token mới
      const loginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'customer@gmail.com', password: 'Customer@123' },
      });
      assert.strictEqual(loginRes.status, 200);
      const activeToken = loginRes.data.token;

      // Xác minh token hoạt động
      const verifyActive = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      assert.strictEqual(verifyActive.status, 200, 'Token phải hoạt động trước khi đăng xuất');

      // Đăng xuất
      const logoutRes = await request('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      assert.strictEqual(logoutRes.status, 200, 'Đăng xuất phải thành công');

      // Sử dụng lại token cũ -> PHẢI BỊ 401 vì session đã bị thu hồi
      const verifyRevoked = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      assert.strictEqual(verifyRevoked.status, 401, 'Token sau khi đăng xuất phải bị từ chối với 401');
      assert.match(verifyRevoked.data?.error?.message || '', /thu hồi/i, 'Thông báo phải ghi rõ phiên đã bị thu hồi');
    });

    // -------------------------------------------------------------
    // TEST 8: Luồng đăng nhập hợp lệ vẫn hoạt động đúng
    // -------------------------------------------------------------
    await test('8.1 Đăng nhập quản trị viên hợp lệ (Admin@123456) thành công và gọi được admin API', async () => {
      const adminLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@phuanhsneaker.local', password: 'Admin@123456' },
      });
      assert.strictEqual(adminLoginRes.status, 200, 'Đăng nhập admin phải thành công');
      assert.strictEqual(adminLoginRes.data.user.role, 'ADMIN');
      assert.ok(adminLoginRes.data.token);

      const adminDashboardRes = await request('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminLoginRes.data.token}` },
      });
      assert.strictEqual(adminDashboardRes.status, 200, 'Admin có token hợp lệ phải gọi được dashboard');
      assert.ok(adminDashboardRes.data.totalRevenue !== undefined);
    });

    await test('8.2 Đổi mật khẩu thành công và vô hiệu hóa mật khẩu cũ', async () => {
      const changePassUserRes = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Khách Đổi Pass',
          email: `changepass_${Date.now()}@test.com`,
          password: 'OldPassword123',
        },
      });
      assert.strictEqual(changePassUserRes.status, 201);
      const userToken = changePassUserRes.data.token;
      const userEmail = changePassUserRes.data.user.email;

      // Đổi mật khẩu
      const changeRes = await request('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword999',
        },
      });
      assert.strictEqual(changeRes.status, 200, 'Đổi mật khẩu phải thành công');

      // Đăng nhập bằng mật khẩu cũ phải thất bại (401)
      const oldLogin = await request('/api/auth/login', {
        method: 'POST',
        body: { email: userEmail, password: 'OldPassword123' },
      });
      assert.strictEqual(oldLogin.status, 401, 'Mật khẩu cũ không còn hoạt động');

      // Đăng nhập bằng mật khẩu mới phải thành công (200)
      const newLogin = await request('/api/auth/login', {
        method: 'POST',
        body: { email: userEmail, password: 'NewPassword999' },
      });
      assert.strictEqual(newLogin.status, 200, 'Mật khẩu mới hoạt động bình thường');
    });

    console.log(`\n======================================================`);
    console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} BÀI TEST ĐẠT (100% THÀNH CÔNG)`);
    console.log(`======================================================\n`);
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
}

runTests().catch((err) => {
  console.error('\nBỘ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
