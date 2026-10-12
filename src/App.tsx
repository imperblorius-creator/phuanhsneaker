import React, { useState, useEffect, useCallback } from 'react';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FeaturesBar } from './components/FeaturesBar';
import { LoginModal } from './components/LoginModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { HomeView } from './pages/HomeView';
import { CollectionView } from './pages/CollectionView';
import { ProductDetailView } from './pages/ProductDetailView';
import { AccountView } from './pages/AccountView';
import { AdminView } from './pages/AdminView';
import { api } from './services/api';
import { Product, Banner, Order } from './types';
import { INITIAL_PRODUCTS, INITIAL_BANNERS } from './data/initialProducts';

type ActiveView = 'home' | 'collection' | 'product' | 'account' | 'admin';

const MainApp: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [currentCategory, setCurrentCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await api.getProducts({ q: searchQuery, category: currentCategory });
      setProducts(res.products || INITIAL_PRODUCTS);
    } catch {
      // Graceful local catalog
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [searchQuery, currentCategory]);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await api.getBanners();
      if (res.banners && res.banners.length) {
        setBanners(res.banners);
      }
    } catch {
      setBanners(INITIAL_BANNERS);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleNavigate = (
    view: 'home' | 'collection' | 'account' | 'admin',
    category?: string
  ) => {
    if (view === 'collection' && category) {
      setCurrentCategory(category);
      setSearchQuery('');
    }
    if (view === 'admin' && !isAdmin) {
      showToast('Bạn cần đăng nhập với quyền Admin để vào trang quản trị', 'error');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentCategory('ALL');
    setCurrentView('collection');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
      )}

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            banners={banners}
            products={products}
            isLoading={isLoadingProducts}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'collection' && (
          <CollectionView
            currentCategory={currentCategory}
            products={products}
            isLoading={isLoadingProducts}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={products.filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)}
            onBack={() => setCurrentView('collection')}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCollection={(cat) => handleNavigate('collection', cat || 'ALL')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            onNavigateHome={() => handleNavigate('home')}
            onNavigateShop={() => handleNavigate('collection', 'ALL')}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onNavigateHome={() => handleNavigate('home')} />
        )}
      </main>

      {/* Global Features Bar & Footer on Storefront */}
      {currentView !== 'admin' && (
        <>
          <FeaturesBar />
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* Global Modals */}
      <LoginModal />
      <CheckoutModal onOrderSuccess={(order) => setCompletedOrder(order)} />
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onViewOrders={() => {
          setCompletedOrder(null);
          handleNavigate('account');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
