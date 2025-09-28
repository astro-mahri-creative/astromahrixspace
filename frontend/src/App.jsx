import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom";
import { signout } from "./actions/userActions";
import { listProductCategories } from "./actions/productActions";

// Route Components
import AdminRoute from "./components/AdminRoute.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import SellerRoute from "./components/SellerRoute.jsx";

// UI Components
import SearchBox from "./components/SearchBox.jsx";
import LoadingBox from "./components/LoadingBox.jsx";
import MessageBox from "./components/MessageBox.jsx";
import ChatBox from "./components/ChatBox.jsx";
import ModernNavigation from "./components/ModernNavigation.jsx";

// Screen Components
import CartScreen from "./screens/CartScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import MediaLibraryScreen from "./screens/MediaLibraryScreen.jsx";
import GameLibraryScreen from "./screens/GameLibraryScreen.jsx";
import ContactScreen from "./screens/ContactScreen.jsx";
import OrderHistoryScreen from "./screens/OrderHistoryScreen.jsx";
import OrderScreen from "./screens/OrderScreen.jsx";
import PaymentMethodScreen from "./screens/PaymentMethodScreen.jsx";
import PlaceOrderScreen from "./screens/PlaceOrderScreen.jsx";
import ProductListScreen from "./screens/ProductListScreen.jsx";
import ProductScreen from "./screens/ProductScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import ShippingAddressScreen from "./screens/ShippingAddressScreen.jsx";
import SigninScreen from "./screens/SigninScreen.jsx";
import ProductEditScreen from "./screens/ProductEditScreen.jsx";
import OrderListScreen from "./screens/OrderListScreen.jsx";
import UserListScreen from "./screens/UserListScreen.jsx";
import UserEditScreen from "./screens/UserEditScreen.jsx";
import SellerScreen from "./screens/SellerScreen.jsx";
import SearchScreen from "./screens/SearchScreen.jsx";
import MapScreen from "./screens/MapScreen.jsx";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import SupportScreen from "./screens/SupportScreen.jsx";
import CMSDashboardScreen from "./screens/CMSDashboardScreen.jsx";
import CMSArtistsScreen from "./screens/CMSArtistsScreen.jsx";
import CMSProductsScreen from "./screens/CMSProductsScreen.jsx";
import CMSProductEditScreen from "./screens/CMSProductEditScreen.jsx";
import CMSNavigationScreen from "./screens/CMSNavigationScreen.jsx";

function App() {
  console.log("[App] mounted");
  const cart = useSelector((state) => state.cart);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { cartItems } = cart;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout());
  };

  const productCategoryList = useSelector((state) => state.productCategoryList);
  const {
    loading: loadingCategories,
    error: errorCategories,
    categories,
  } = productCategoryList;
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="grid-container">
        <ModernNavigation
          user={userInfo}
          cartItems={cartItems}
          onSignOut={signoutHandler}
        />
        <main>
          <Routes>
            <Route path="/seller/:id" element={<SellerScreen />}></Route>
            <Route path="/cart" element={<CartScreen />}></Route>
            <Route path="/cart/:id" element={<CartScreen />}></Route>
            <Route path="/media" element={<MediaLibraryScreen />}></Route>
            <Route path="/games" element={<GameLibraryScreen />}></Route>
            <Route path="/merch" element={<HomeScreen />}></Route>
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/product/:id/edit" element={<ProductEditScreen />} />
            <Route path="/signin" element={<SigninScreen />}></Route>
            <Route path="/register" element={<RegisterScreen />}></Route>
            <Route path="/shipping" element={<ShippingAddressScreen />}></Route>
            <Route path="/payment" element={<PaymentMethodScreen />}></Route>
            <Route path="/placeorder" element={<PlaceOrderScreen />}></Route>
            <Route path="/order/:id" element={<OrderScreen />}></Route>
            <Route
              path="/orderhistory"
              element={<OrderHistoryScreen />}
            ></Route>
            <Route path="/search/name" element={<SearchScreen />} />
            <Route path="/search/name/:name" element={<SearchScreen />} />
            <Route
              path="/search/category/:category"
              element={<SearchScreen />}
            />
            <Route
              path="/search/category/:category/name/:name"
              element={<SearchScreen />}
            />
            <Route
              path="/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order/pageNumber/:pageNumber"
              element={<SearchScreen />}
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/map"
              element={
                <PrivateRoute>
                  <MapScreen />
                </PrivateRoute>
              }
            />

            <Route
              path="/productlist"
              element={
                <AdminRoute>
                  <ProductListScreen />
                </AdminRoute>
              }
            />

            <Route
              path="/productlist/pageNumber/:pageNumber"
              element={
                <AdminRoute>
                  <ProductListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/orderlist"
              element={
                <AdminRoute>
                  <OrderListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/userlist"
              element={
                <AdminRoute>
                  <UserListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/user/:id/edit"
              element={
                <AdminRoute>
                  <UserEditScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms"
              element={
                <AdminRoute>
                  <CMSDashboardScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms/artists"
              element={
                <AdminRoute>
                  <CMSArtistsScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms/products"
              element={
                <AdminRoute>
                  <CMSProductsScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms/products/new"
              element={
                <AdminRoute>
                  <CMSProductEditScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms/products/:id"
              element={
                <AdminRoute>
                  <CMSProductEditScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/cms/navigation"
              element={
                <AdminRoute>
                  <CMSNavigationScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/support"
              element={
                <AdminRoute>
                  <SupportScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/productlist/seller"
              element={
                <SellerRoute>
                  <ProductListScreen />
                </SellerRoute>
              }
            />
            <Route
              path="/orderlist/seller"
              element={
                <SellerRoute>
                  <OrderListScreen />
                </SellerRoute>
              }
            />

            <Route path="/" element={<LandingScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="row center">
          {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
          <div>All right reserved</div>{" "}
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
