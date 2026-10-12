import { Product, Banner, Coupon, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 81265049,
    alias: "cortez-1985-do",
    name: "cortez 1985 đỏ",
    category: "NIKE",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg?v=1779514528587",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg?v=1779514528587"
    ],
    available: true,
    sku: "PVN668",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "PVN668" },
      { label: "37", available: true, quantity: 1, sku: "PVN669" },
      { label: "38", available: true, quantity: 2, sku: "PVN670" },
      { label: "39", available: true, quantity: 7, sku: "PVN671" },
      { label: "40", available: true, quantity: 6, sku: "PVN672" },
      { label: "41", available: true, quantity: 2, sku: "PVN673" },
      { label: "42", available: true, quantity: 2, sku: "PVN674" },
      { label: "43", available: false, quantity: 0, sku: "PVN675" }
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 81264227,
    alias: "nb530-xam",
    name: "nb530 xám",
    category: "NB",
    price: "450.000₫",
    priceValue: 450000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7856406367011-af50479d06d15462c2d6306540261c9e-1779512129393.jpg?v=1779512133703",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7856406367011-af50479d06d15462c2d6306540261c9e-1779512129393.jpg?v=1779512133703"
    ],
    available: true,
    sku: "PVN660",
    sizes: [
      { label: "36", available: true, quantity: 4, sku: "PVN660" },
      { label: "37", available: true, quantity: 5, sku: "PVN661" },
      { label: "38", available: true, quantity: 4, sku: "PVN662" },
      { label: "39", available: true, quantity: 5, sku: "PVN663" },
      { label: "40", available: false, quantity: 0, sku: "PVN664" },
      { label: "41", available: true, quantity: 2, sku: "PVN665" },
      { label: "42", available: true, quantity: 5, sku: "PVN666" },
      { label: "43", available: true, quantity: 3, sku: "PVN667" }
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 81263906,
    alias: "jd-xam-hong-thap",
    name: "jd xám hồng thấp",
    category: "JD",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7856406372134-2d59da8a838ba387aa010a4043b50e0b-1779511395075.jpg?v=1779511398317",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7856406372134-2d59da8a838ba387aa010a4043b50e0b-1779511395075.jpg?v=1779511398317"
    ],
    available: true,
    sku: "PVN656",
    sizes: [
      { label: "36", available: true, quantity: 4, sku: "PVN656" },
      { label: "37", available: true, quantity: 4, sku: "PVN657" },
      { label: "38", available: true, quantity: 4, sku: "PVN658" },
      { label: "39", available: true, quantity: 5, sku: "PVN659" }
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 80765749,
    alias: "samba-quai-dan-nau",
    name: "samba quai dán nâu",
    category: "ADIDAS",
    price: "450.000₫",
    priceValue: 450000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7838101482445-5343f8ed27f0dc909e5261a4c14bacfe-1779085238028.jpg?v=1779085241283",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7838101482445-5343f8ed27f0dc909e5261a4c14bacfe-1779085238028.jpg?v=1779085241283",
      "https://bizweb.dktcdn.net/100/623/516/products/z7838101482629-54789342a85e2f29a96c7c0d03c3d795-1779085238037.jpg?v=1779085242350"
    ],
    available: true,
    sku: "PVN652",
    sizes: [
      { label: "36", available: true, quantity: 4, sku: "PVN652" },
      { label: "37", available: true, quantity: 5, sku: "PVN653" },
      { label: "38", available: true, quantity: 5, sku: "PVN654" },
      { label: "39", available: true, quantity: 5, sku: "PVN655" }
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 80764710,
    alias: "samba-quai-dan-kem",
    name: "samba quai dán kem",
    category: "ADIDAS",
    price: "450.000₫",
    priceValue: 450000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7837930919514-a4d6ee740b338363f66360a8e3464990-1779082639391.jpg?v=1779082643010",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7837930919514-a4d6ee740b338363f66360a8e3464990-1779082639391.jpg?v=1779082643010"
    ],
    available: true,
    sku: "PVN646",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "PVN646" },
      { label: "37", available: false, quantity: 0, sku: "PVN647" },
      { label: "38", available: true, quantity: 1, sku: "PVN648" },
      { label: "39", available: false, quantity: 0, sku: "PVN649" }
    ],
    isNewArrival: true
  },
  {
    id: 80690042,
    alias: "nike-v2k-xam-den",
    name: "nike v2k xám đen",
    category: "NIKE",
    price: "440.000₫",
    priceValue: 440000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7831791878915-7dd11fd4e406805a19665087c0dce92d-1779250028345.jpg?v=1779250065717",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7831791878915-7dd11fd4e406805a19665087c0dce92d-1779250028345.jpg?v=1779250065717",
      "https://bizweb.dktcdn.net/100/623/516/products/z7831791867019-c5878ae5c4e3c1db80b358fb4369b0a4-1779250024876.jpg?v=1779250065717",
      "https://bizweb.dktcdn.net/100/623/516/products/z7831791870695-d11737ccdb437e5ed4b7767948d6d24b-1779250026201.jpg?v=1779250065717"
    ],
    available: true,
    sku: "PVN638",
    sizes: [
      { label: "36", available: true, quantity: 2, sku: "PVN638" },
      { label: "37", available: false, quantity: 0, sku: "PVN639" },
      { label: "38", available: false, quantity: 0, sku: "PVN640" },
      { label: "39", available: false, quantity: 0, sku: "PVN641" },
      { label: "40", available: false, quantity: 0, sku: "PVN642" },
      { label: "41", available: true, quantity: 3, sku: "PVN643" },
      { label: "42", available: true, quantity: 1, sku: "PVN644" },
      { label: "43", available: true, quantity: 3, sku: "PVN645" }
    ],
    isNewArrival: true
  },
  {
    id: 80637520,
    alias: "bb-tiger-ren-den",
    name: "bb tiger ren đen",
    category: "TIGER",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7827929823228-999219d645544a1582fb585d58f8f9ae-1778824649033.jpg?v=1778824652263",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7827929823228-999219d645544a1582fb585d58f8f9ae-1778824649033.jpg?v=1778824652263"
    ],
    available: true,
    sku: "PVN634",
    sizes: [
      { label: "36", available: true, quantity: 4, sku: "PVN634" },
      { label: "37", available: true, quantity: 2, sku: "PVN635" },
      { label: "38", available: false, quantity: 0, sku: "PVN636" },
      { label: "39", available: true, quantity: 1, sku: "PVN637" }
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 80637501,
    alias: "bb-tiger-ren-xam",
    name: "bb tiger ren xám",
    category: "TIGER",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7827929834959-03bf8930e9449694e72179f027c15788-1778824585892.jpg?v=1778824588230",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7827929834959-03bf8930e9449694e72179f027c15788-1778824585892.jpg?v=1778824588230"
    ],
    available: true,
    sku: "PVN630",
    sizes: [
      { label: "36", available: true, quantity: 2, sku: "PVN630" },
      { label: "37", available: true, quantity: 1, sku: "PVN631" },
      { label: "38", available: true, quantity: 1, sku: "PVN632" },
      { label: "39", available: true, quantity: 3, sku: "PVN633" }
    ],
    isNewArrival: true
  },
  {
    id: 80637437,
    alias: "bb-tiger-ren-be",
    name: "bb tiger ren be",
    category: "TIGER",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7827929843188-7f55be3d4bb3c682a2c28bb9ded6748f-1778824399670.jpg?v=1778824403213",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7827929843188-7f55be3d4bb3c682a2c28bb9ded6748f-1778824399670.jpg?v=1778824403213"
    ],
    available: false,
    sku: "PVN626",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "PVN626" },
      { label: "37", available: false, quantity: 0, sku: "PVN627" },
      { label: "38", available: false, quantity: 0, sku: "PVN628" },
      { label: "39", available: false, quantity: 0, sku: "PVN629" }
    ],
    isNewArrival: true
  },
  {
    id: 80630949,
    alias: "bb-tiger-kem-than",
    name: "bb tiger kem than",
    category: "TIGER",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7825917728864-6a7e9db125b20779aba081f6d9bd7dbd-1778818051164.jpg?v=1778818054987",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7825917728864-6a7e9db125b20779aba081f6d9bd7dbd-1778818051164.jpg?v=1778818054987",
      "https://bizweb.dktcdn.net/100/623/516/products/z7825917733765-ad41af1e1989752b0326a611d532ac33-1778818051176.jpg?v=1778818055487"
    ],
    available: true,
    sku: "PVN622",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "PVN622" },
      { label: "37", available: true, quantity: 1, sku: "PVN623" },
      { label: "38", available: false, quantity: 0, sku: "PVN624" },
      { label: "39", available: false, quantity: 0, sku: "PVN625" }
    ],
    isNewArrival: true
  },
  {
    id: 80630529,
    alias: "bup-be-tiger-vang",
    name: "búp bê tiger vàng",
    category: "TIGER",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7825902175573-67d674ddb68f77c314f8d51110068049-1778817495999.jpg?v=1778817500537",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7825902175573-67d674ddb68f77c314f8d51110068049-1778817495999.jpg?v=1778817500537",
      "https://bizweb.dktcdn.net/100/623/516/products/z7825902168021-ba902406ac700d37e631986cc7796856-1778817496010.jpg?v=1778817501057"
    ],
    available: true,
    sku: "PVN618",
    sizes: [
      { label: "36", available: true, quantity: 3, sku: "PVN618" },
      { label: "37", available: true, quantity: 5, sku: "PVN619" },
      { label: "38", available: true, quantity: 5, sku: "PVN620" },
      { label: "39", available: true, quantity: 6, sku: "PVN621" }
    ],
    isNewArrival: true
  },
  {
    id: 80629761,
    alias: "jeep-xam-xanh",
    name: "Jeep xám xanh",
    category: "KHÁC",
    price: "520.000₫",
    priceValue: 520000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7825852412030-16a8c02de3421f03c99fe1e888b4d398-1778817111820.jpg?v=1778817116947",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7825852412030-16a8c02de3421f03c99fe1e888b4d398-1778817111820.jpg?v=1778817116947",
      "https://bizweb.dktcdn.net/100/623/516/products/z7825852416040-ef0b6406596ae9c42fa766cf200ac99f-1778817111835.jpg?v=1778817117930"
    ],
    available: true,
    sku: "PVN614",
    sizes: [
      { label: "36", available: true, quantity: 3, sku: "PVN614" },
      { label: "37", available: true, quantity: 4, sku: "PVN615" },
      { label: "38", available: false, quantity: 0, sku: "PVN616" },
      { label: "39", available: true, quantity: 5, sku: "PVN617" }
    ]
  },
  {
    id: 80584909,
    alias: "jeep-xam",
    name: "Jeep xám",
    category: "KHÁC",
    price: "520.000₫",
    priceValue: 520000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7825868239407-b843eed7ae3c9b2b1bd9cfd42e4e4ac7-1778817144470.jpg?v=1778817148877",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7825868239407-b843eed7ae3c9b2b1bd9cfd42e4e4ac7-1778817144470.jpg?v=1778817148877"
    ],
    available: true,
    sku: "PVN610",
    sizes: [
      { label: "36", available: true, quantity: 1, sku: "PVN610" },
      { label: "37", available: true, quantity: 3, sku: "PVN611" },
      { label: "38", available: false, quantity: 0, sku: "PVN612" },
      { label: "39", available: false, quantity: 0, sku: "PVN613" }
    ]
  },
  {
    id: 80578572,
    alias: "jeep-xam-do",
    name: "jeep xám đỏ",
    category: "KHÁC",
    price: "510.000₫",
    priceValue: 510000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7823900032251-0101d1b195b621eade61f38862bbaae0-1778732673007.jpg?v=1778732678053",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7823900032251-0101d1b195b621eade61f38862bbaae0-1778732673007.jpg?v=1778732678053"
    ],
    available: true,
    sku: "PVN606",
    sizes: [
      { label: "36", available: true, quantity: 3, sku: "PVN606" },
      { label: "37", available: true, quantity: 4, sku: "PVN607" },
      { label: "38", available: false, quantity: 0, sku: "PVN608" },
      { label: "39", available: true, quantity: 4, sku: "PVN609" }
    ]
  },
  {
    id: 80533017,
    alias: "bb-puma-xanh-duong",
    name: "bb puma xanh dương",
    category: "PUMA",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7823749185240-c1bde3cf15d8e63ed082e72c24d61fb8-1778729575317.jpg?v=1778729709983",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7823749185240-c1bde3cf15d8e63ed082e72c24d61fb8-1778729575317.jpg?v=1778729709983"
    ],
    available: true,
    sku: "PVN602",
    sizes: [
      { label: "36", available: true, quantity: 9, sku: "PVN602" },
      { label: "37", available: true, quantity: 4, sku: "PVN603" },
      { label: "38", available: true, quantity: 3, sku: "PVN604" },
      { label: "39", available: true, quantity: 6, sku: "PVN605" }
    ],
    isFeatured: true
  },
  {
    id: 80515095,
    alias: "bb-puma-xam-reu",
    name: "bb puma xám rêu",
    category: "PUMA",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7823726690883-e7979ddbc2465129cb809133a5694ad5-1778728045309.jpg?v=1778728088917",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7823726690883-e7979ddbc2465129cb809133a5694ad5-1778728045309.jpg?v=1778728088917"
    ],
    available: true,
    sku: "PVN598",
    sizes: [
      { label: "36", available: true, quantity: 2, sku: "PVN598" },
      { label: "37", available: false, quantity: 0, sku: "PVN599" },
      { label: "38", available: true, quantity: 1, sku: "PVN600" },
      { label: "39", available: true, quantity: 5, sku: "PVN601" }
    ]
  },
  {
    id: 79811486,
    alias: "suc-tiger-hong",
    name: "sục tiger hồng",
    category: "TIGER",
    price: "520.000₫",
    priceValue: 520000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7790058712788-38da5370a3518144609ff721eebc5258-1777959819943.jpg?v=1777959825180",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7790058712788-38da5370a3518144609ff721eebc5258-1777959819943.jpg?v=1777959825180"
    ],
    available: true,
    sku: "PVN570",
    sizes: [
      { label: "36", available: true, quantity: 3, sku: "PVN570" },
      { label: "37", available: true, quantity: 5, sku: "PVN571" },
      { label: "38", available: true, quantity: 5, sku: "PVN572" },
      { label: "39", available: true, quantity: 3, sku: "PVN573" }
    ],
    isFeatured: true
  },
  {
    id: 79459883,
    alias: "puma-speedcat-xam-bac-1",
    name: "puma speedcat xám bạc",
    category: "PUMA",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7772103059192-d4af2de8b390ae063732c49b959db08b-1777429822498.jpg?v=1777429829283",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7772103059192-d4af2de8b390ae063732c49b959db08b-1777429822498.jpg?v=1777429829283"
    ],
    available: false,
    sku: "PVN562",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "PVN562" },
      { label: "37", available: false, quantity: 0, sku: "PVN563" },
      { label: "38", available: false, quantity: 0, sku: "PVN564" },
      { label: "39", available: false, quantity: 0, sku: "PVN565" },
      { label: "40", available: false, quantity: 0, sku: "PVN566" },
      { label: "41", available: false, quantity: 0, sku: "PVN567" },
      { label: "42", available: false, quantity: 0, sku: "PVN568" },
      { label: "43", available: false, quantity: 0, sku: "PVN569" }
    ]
  },
  {
    id: 78697598,
    alias: "jd-den-xam-pq-thap-sc",
    name: "jd đen xám pq thấp sc",
    category: "JD",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7738964132343-8845e42dd3e69ce9b4e20ec846c1b946-1776658915359.jpg?v=1776658920393",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7738964132343-8845e42dd3e69ce9b4e20ec846c1b946-1776658915359.jpg?v=1776658920393"
    ],
    available: true,
    sku: "PVN502",
    sizes: [
      { label: "36", available: true, quantity: 2, sku: "PVN502" },
      { label: "37", available: true, quantity: 4, sku: "PVN503" },
      { label: "38", available: true, quantity: 1, sku: "PVN504" },
      { label: "39", available: true, quantity: 6, sku: "PVN505" },
      { label: "40", available: true, quantity: 6, sku: "PVN506" },
      { label: "41", available: true, quantity: 4, sku: "PVN507" },
      { label: "42", available: true, quantity: 5, sku: "PVN508" },
      { label: "43", available: true, quantity: 3, sku: "PVN509" }
    ],
    isFeatured: true
  },
  {
    id: 77354907,
    alias: "mlb-2025-ny-trang-nau",
    name: "mlb 2025 NY trắng nâu",
    category: "MLB",
    price: "490.000₫",
    priceValue: 490000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7703354883588-3d1f2a6c28335bce6b9a8a8a5245504a-1775623794295.jpg?v=1775623997380",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7703354883588-3d1f2a6c28335bce6b9a8a8a5245504a-1775623794295.jpg?v=1775623997380"
    ],
    available: true,
    sku: "PVN458",
    sizes: [
      { label: "36", available: true, quantity: 1, sku: "PVN458" },
      { label: "37", available: false, quantity: 0, sku: "PVN459" },
      { label: "38", available: true, quantity: 1, sku: "PVN460" },
      { label: "39", available: true, quantity: 3, sku: "PVN461" },
      { label: "40", available: true, quantity: 4, sku: "PVN462" },
      { label: "41", available: true, quantity: 2, sku: "PVN463" },
      { label: "42", available: false, quantity: 0, sku: "PVN464" },
      { label: "43", available: true, quantity: 5, sku: "PVN465" }
    ]
  },
  {
    id: 76782648,
    alias: "nike-sb-valentine-2026",
    name: "nike SB valentine 2026",
    category: "NIKE",
    price: "490.000₫",
    priceValue: 490000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7727481982418-6dad419a1fd75916349b3217c000c3b6-1776230016709.jpg?v=1776230044847",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7727481982418-6dad419a1fd75916349b3217c000c3b6-1776230016709.jpg?v=1776230044847"
    ],
    available: true,
    sku: "PVN398",
    sizes: [
      { label: "36", available: true, quantity: 7, sku: "PVN398" },
      { label: "37", available: true, quantity: 9, sku: "PVN399" },
      { label: "38", available: true, quantity: 15, sku: "PVN400" },
      { label: "39", available: true, quantity: 4, sku: "PVN401" }
    ],
    isFeatured: true
  },
  {
    id: 67470853,
    alias: "tiger-kem-hong",
    name: "tiger kem hồng",
    category: "TIGER",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737",
      "https://bizweb.dktcdn.net/100/623/516/products/z7841003827018-cfaeee786373ea2f3f9ae26222ce0529-1779179004516.jpg?v=1779186927870"
    ],
    available: true,
    sku: "SP23523",
    sizes: [
      { label: "36", available: true, quantity: 7, sku: "SP23523" },
      { label: "37", available: true, quantity: 2, sku: "SP23524" },
      { label: "38", available: true, quantity: 7, sku: "SP23525" },
      { label: "39", available: true, quantity: 3, sku: "SP23526" },
      { label: "40", available: true, quantity: 4, sku: "PVN650" }
    ],
    isFeatured: true
  },
  {
    id: 67470913,
    alias: "lv-xam-hoa-tiet",
    name: "LV xám họa tiết",
    category: "LV",
    price: "500.000₫",
    priceValue: 500000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z6186988758725-9ec60a1435702f97e83c492bf6b698cd-1735724754784.jpg?v=1767057650527",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z6186988758725-9ec60a1435702f97e83c492bf6b698cd-1735724754784.jpg?v=1767057650527"
    ],
    available: true,
    sku: "SP23659",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "SP23659" },
      { label: "37", available: true, quantity: 3, sku: "SP23660" },
      { label: "38", available: true, quantity: 2, sku: "SP23661" },
      { label: "39", available: true, quantity: 1, sku: "SP23662" },
      { label: "40", available: false, quantity: 0, sku: "SP23663" },
      { label: "41", available: false, quantity: 0, sku: "SP23664" },
      { label: "42", available: false, quantity: 0, sku: "SP23665" },
      { label: "43", available: false, quantity: 0, sku: "SP23666" }
    ],
    isFeatured: true
  },
  {
    id: 67470909,
    alias: "vans-knu-hong",
    name: "vans knu hồng",
    category: "VANS",
    price: "450.000₫",
    priceValue: 450000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z6180039038256-61c03f61be791f7d17e42938f0ffd846-1735549161132.jpg?v=1767057648070",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z6180039038256-61c03f61be791f7d17e42938f0ffd846-1735549161132.jpg?v=1767057648070"
    ],
    available: true,
    sku: "SP23639",
    sizes: [
      { label: "36", available: true, quantity: 7, sku: "SP23639" },
      { label: "37", available: true, quantity: 7, sku: "SP23640" },
      { label: "38", available: true, quantity: 11, sku: "SP23641" },
      { label: "39", available: true, quantity: 3, sku: "SP23642" }
    ]
  },
  {
    id: 67470903,
    alias: "nike-sb58-moc-do",
    name: "nike sb58 móc đỏ",
    category: "NIKE",
    price: "450.000₫",
    priceValue: 450000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7754850718283-bb2d56e472c8e1cf4eae0c138c5619f1-1776922678490.jpg?v=1776922747947",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7754850718283-bb2d56e472c8e1cf4eae0c138c5619f1-1776922678490.jpg?v=1776922747947"
    ],
    available: true,
    sku: "SP23599",
    sizes: [
      { label: "36", available: true, quantity: 4, sku: "SP23599" },
      { label: "37", available: false, quantity: 0, sku: "SP23600" },
      { label: "38", available: true, quantity: 2, sku: "SP23601" },
      { label: "39", available: false, quantity: 0, sku: "SP23602" },
      { label: "40", available: true, quantity: 3, sku: "SP23603" },
      { label: "41", available: true, quantity: 1, sku: "SP23604" },
      { label: "42", available: false, quantity: 0, sku: "SP23605" },
      { label: "43", available: true, quantity: 2, sku: "SP23606" }
    ],
    isFeatured: true
  },
  {
    id: 67470874,
    alias: "lv-charm-trang-xam",
    name: "lv charm trắng xám",
    category: "LV",
    price: "510.000₫",
    priceValue: 510000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z6490909763107-ab15477d591a89c945834c33d14511c2-1744268216884.jpg?v=1767057632783",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z6490909763107-ab15477d591a89c945834c33d14511c2-1744268216884.jpg?v=1767057632783"
    ],
    available: true,
    sku: "SP23567",
    sizes: [
      { label: "36", available: true, quantity: 2, sku: "SP23567" },
      { label: "37", available: true, quantity: 1, sku: "SP23568" },
      { label: "38", available: true, quantity: 1, sku: "SP23569" },
      { label: "39", available: false, quantity: 0, sku: "SP23570" },
      { label: "40", available: false, quantity: 0, sku: "SP23571" }
    ]
  },
  {
    id: 67470827,
    alias: "gucci-screener-xanh",
    name: "GUCCI SCREENER XANH",
    category: "GUCCI",
    price: "550.000₫",
    priceValue: 550000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z5972005755218-c10d5ba8d83de593f543097027f87c56-1730011029201.jpg?v=1767057599450",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z5972005755218-c10d5ba8d83de593f543097027f87c56-1730011029201.jpg?v=1767057599450"
    ],
    available: false,
    sku: "SP23315",
    sizes: [
      { label: "36", available: false, quantity: 0, sku: "SP23315" },
      { label: "37", available: false, quantity: 0, sku: "SP23316" },
      { label: "38", available: false, quantity: 0, sku: "SP23317" },
      { label: "39", available: false, quantity: 0, sku: "SP23318" }
    ]
  },
  {
    id: 67470802,
    alias: "puma-speedcat-den",
    name: "puma speedcat đen",
    category: "PUMA",
    price: "470.000₫",
    priceValue: 470000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7433498104223-7920bb524616f7aa51ae6f2ab92f8ff3-1769064328710.jpg?v=1769064498643",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7433498104223-7920bb524616f7aa51ae6f2ab92f8ff3-1769064328710.jpg?v=1769064498643"
    ],
    available: true,
    sku: "SP23123",
    sizes: [
      { label: "36", available: true, quantity: 3, sku: "SP23123" },
      { label: "37", available: true, quantity: 3, sku: "SP23124" },
      { label: "38", available: false, quantity: 0, sku: "SP23125" },
      { label: "39", available: true, quantity: 2, sku: "SP23126" },
      { label: "40", available: false, quantity: 0, sku: "SP23127" },
      { label: "41", available: true, quantity: 1, sku: "SP23128" }
    ],
    isFeatured: true
  },
  {
    id: 67470735,
    alias: "vans-knu-skool-den",
    name: "vans knu skool đen",
    category: "VANS",
    price: "470.000₫",
    priceValue: 470000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z7628844857830-07b7a7ac1fce1b62cd5c08ad69705355-1773820459669.jpg?v=1773820462833",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z7628844857830-07b7a7ac1fce1b62cd5c08ad69705355-1773820459669.jpg?v=1773820462833"
    ],
    available: true,
    sku: "SP22619",
    sizes: [
      { label: "36", available: true, quantity: 5, sku: "SP22619" },
      { label: "37", available: true, quantity: 5, sku: "SP22620" },
      { label: "38", available: true, quantity: 1, sku: "SP22621" },
      { label: "39", available: true, quantity: 2, sku: "SP22622" },
      { label: "40", available: true, quantity: 2, sku: "SP22623" },
      { label: "41", available: true, quantity: 4, sku: "SP22624" },
      { label: "42", available: true, quantity: 2, sku: "SP22625" },
      { label: "43", available: true, quantity: 4, sku: "SP22626" }
    ],
    isFeatured: true
  },
  {
    id: 67469877,
    alias: "blz-trang-den-cao",
    name: "blz trắng đen cao",
    category: "BALENCIAGA",
    price: "460.000₫",
    priceValue: 460000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z3766819528031-2ccb7839fbc624dee935faee3d1046b4-1664706801986.jpg?v=1767057124410",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z3766819528031-2ccb7839fbc624dee935faee3d1046b4-1664706801986.jpg?v=1767057124410"
    ],
    available: true,
    sku: "SP18622",
    sizes: [
      { label: "36", available: true, quantity: 9, sku: "SP18622" },
      { label: "37", available: true, quantity: 1, sku: "SP18623" },
      { label: "38", available: false, quantity: 0, sku: "SP18624" },
      { label: "39", available: true, quantity: 2, sku: "SP18625" }
    ]
  },
  {
    id: 67470605,
    alias: "champion-xam",
    name: "champion xám",
    category: "CHAMPION",
    price: "480.000₫",
    priceValue: 480000,
    compareAt: "",
    compareAtValue: 0,
    image: "https://bizweb.dktcdn.net/100/623/516/products/z6953972844827-4621dd734b6cfc17017a25d628531e91-1756378715555.jpg?v=1767057375970",
    images: [
      "https://bizweb.dktcdn.net/100/623/516/products/z6953972844827-4621dd734b6cfc17017a25d628531e91-1756378715555.jpg?v=1767057375970"
    ],
    available: true,
    sku: "SP24133",
    sizes: [
      { label: "36", available: true, quantity: 1, sku: "SP24133" },
      { label: "37", available: false, quantity: 0, sku: "SP24134" },
      { label: "38", available: false, quantity: 0, sku: "SP24135" },
      { label: "39", available: false, quantity: 0, sku: "SP24136" },
      { label: "40", available: false, quantity: 0, sku: "SP24137" },
      { label: "41", available: false, quantity: 0, sku: "SP24138" },
      { label: "42", available: false, quantity: 0, sku: "SP24139" }
    ]
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'PHUANH SNEAKER\nNEW ARRIVALS',
    subtitle: 'SẢN PHẨM MỚI CẬP NHẬT TẠI CỬA HÀNG',
    image: 'https://i.pinimg.com/1200x/3b/a4/96/3ba4961ff3057758f3febe4edecd7cc0.jpg?v=1779186926737',
    linkText: 'Mua sắm ngay',
    linkCollection: 'ALL',
    order: 1,
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'JORDAN & NIKE\nSTREETWEAR ICON',
    subtitle: 'BỘ SƯU TẬP JD VÀ NIKE SB58 ĐỈNH CAO',
    image: 'https://i.pinimg.com/736x/1d/29/6d/1d296d408b5e2d305e67c3b0d888f62d.jpg?v=1767596173883',
    linkText: 'Khám phá ngay',
    linkCollection: 'JD',
    order: 2,
    isActive: true
  },
  {
    id: 'banner-3',
    title: 'ONITSUKA TIGER\nRETRO CLASSICS',
    subtitle: 'CÁC MẪU TIGER KEM HỒNG, BẠC & BÚP BÊ HOT NHẤT',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737',
    linkText: 'Xem bộ sưu tập',
    linkCollection: 'TIGER',
    order: 3,
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'PHUANH50',
    discountType: 'fixed',
    discountValue: 50000,
    minSpend: 400000,
    usageLimit: 1000,
    usageCount: 14,
    isActive: true,
    description: 'Giảm 50.000₫ cho đơn từ 400.000₫'
  },
  {
    code: 'SNEAKER10',
    discountType: 'fixed',
    discountValue: 100000,
    minSpend: 800000,
    usageLimit: 500,
    usageCount: 8,
    isActive: true,
    description: 'Giảm 100.000₫ cho đơn từ 800.000₫'
  },
  {
    code: 'VIP10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 500000,
    maxDiscount: 150000,
    usageLimit: 200,
    usageCount: 5,
    isActive: true,
    description: 'Giảm 10% (tối đa 150.000₫) cho khách hàng VIP'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'PhuAnh Sneaker',
  hotline: '0397233999',
  email: 'phuanhsneaker@gmail.com',
  announcementText: 'SẢN PHẨM MỚI CẬP NHẬT TẠI PHUANH SNEAKER',
  address: 'Số 123 Đường Sneaker, Quận 1, TP. Hồ Chí Minh',
  bankName: 'Vietcombank',
  bankAccount: '0397233999',
  bankOwner: 'PHUANH SNEAKER',
  shippingFee: 30000,
  freeShippingThreshold: 1000000
};
