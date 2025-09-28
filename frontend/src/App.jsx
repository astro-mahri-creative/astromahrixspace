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
        <header className="row">
          <div>
            <button
              type="button"
              className="open-sidebar"
              onClick={() => setSidebarIsOpen(true)}
            >
              <i className="fa fa-bars"></i>
            </button>
            <Link className="brand" to="/">
              astromahrixspace
            </Link>
          </div>
          <div>
            <SearchBox />
          </div>
          <div
            className="top-links"
            style={{ display: "flex", gap: ".75rem", alignItems: "center" }}
          >
            <Link to="/">Home</Link>
            <Link to="/#media">Media</Link>
            <Link to="/#games">Games</Link>
            <Link to="/#merch">Merch</Link>
            <Link to="/#contact">Contact</Link>
            <Link to="/cart">
              Cart
              {cartItems.length > 0 && (
                <span className="badge">{cartItems.length}</span>
              )}
            </Link>
            {userInfo ? (
              <div className="dropdown">
                <Link to="#">
                  {userInfo.name} <i className="fa fa-caret-down"></i>{" "}
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/profile">User Profile</Link>
                  </li>
                  <li>
                    <Link to="/orderhistory">Order History</Link>
                  </li>
                  <li>
                    <Link to="#signout" onClick={signoutHandler}>
                      Sign Out
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/signin">Sign In</Link>
            )}
            {userInfo && userInfo.isSeller && (
              <div className="dropdown">
                <Link to="#admin">
                  Seller <i className="fa fa-caret-down"></i>
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/productlist/seller">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist/seller">Orders</Link>
                  </li>
                </ul>
              </div>
            )}
            {userInfo && userInfo.isAdmin && (
              <div className="dropdown">
                <Link to="#admin">
                  Admin <i className="fa fa-caret-down"></i>
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/productlist">Products</Link>
                  </li>
                  <li>
                    <Link to="/orderlist">Orders</Link>
                  </li>
                  <li>
                    <Link to="/userlist">Users</Link>
                  </li>
                  <li>
                    <Link to="/support">Support</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>
        <aside className={sidebarIsOpen ? "open" : ""}>
          <ul className="categories">
            <li>
              <strong>Categories</strong>
              <button
                onClick={() => setSidebarIsOpen(false)}
                className="close-sidebar"
                type="button"
              >
                <i className="fa fa-close"></i>
              </button>
            </li>
            {loadingCategories ? (
              <LoadingBox></LoadingBox>
            ) : errorCategories ? (
              <MessageBox variant="danger">{errorCategories}</MessageBox>
            ) : (
              categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/search/category/${c}`}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    {c}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside>
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
