import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom";
import { signout } from "./actions/userActions";
import AdminRoute from "./components/AdminRoute.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import CartScreen from "./screens/CartScreen";
import HomeScreen from "./screens/HomeScreen";
import LandingScreen from "./screens/LandingScreen";
import MediaLibraryScreen from "./screens/MediaLibraryScreen";
import GameLibraryScreen from "./screens/GameLibraryScreen";
// Merch renders the product catalog (former HomeScreen) at /merch
import ContactScreen from "./screens/ContactScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import OrderScreen from "./screens/OrderScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import ProductListScreen from "./screens/ProductListScreen";
import ProductScreen from "./screens/ProductScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SigninScreen from "./screens/SigninScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import SellerRoute from "./components/SellerRoute.jsx";
import SellerScreen from "./screens/SellerScreen";
import SearchBox from "./components/SearchBox.jsx";
import SearchScreen from "./screens/SearchScreen";
import { listProductCategories } from "./actions/productActions";
import LoadingBox from "./components/LoadingBox.jsx";
import MessageBox from "./components/MessageBox.jsx";
import MapScreen from "./screens/MapScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SupportScreen from "./screens/SupportScreen";
import ChatBox from "./components/ChatBox.jsx";
function App() {
  const cart = useSelector(state => state.cart);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const {
    cartItems
  } = cart;
  const userSignin = useSelector(state => state.userSignin);
  const {
    userInfo
  } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout());
  };
  const productCategoryList = useSelector(state => state.productCategoryList);
  const {
    loading: loadingCategories,
    error: errorCategories,
    categories
  } = productCategoryList;
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);
  return /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement("div", {
    className: "grid-container"
  }, /*#__PURE__*/React.createElement("header", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "open-sidebar",
    onClick: () => setSidebarIsOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-bars"
  })), /*#__PURE__*/React.createElement(Link, {
    className: "brand",
    to: "/"
  }, "astromahrixspace")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SearchBox, null)), /*#__PURE__*/React.createElement("div", {
    className: "top-links",
    style: {
      display: "flex",
      gap: ".75rem",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Link, {
    to: "/"
  }, "Home"), /*#__PURE__*/React.createElement(Link, {
    to: "/media"
  }, "Media"), /*#__PURE__*/React.createElement(Link, {
    to: "/games"
  }, "Games"), /*#__PURE__*/React.createElement(Link, {
    to: "/merch"
  }, "Merch"), /*#__PURE__*/React.createElement(Link, {
    to: "/contact"
  }, "Contact"), /*#__PURE__*/React.createElement(Link, {
    to: "/cart"
  }, "Cart", cartItems.length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, cartItems.length)), userInfo ? /*#__PURE__*/React.createElement("div", {
    className: "dropdown"
  }, /*#__PURE__*/React.createElement(Link, {
    to: "#"
  }, userInfo.name, " ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-caret-down"
  }), " "), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-content"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/profile"
  }, "User Profile")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/orderhistory"
  }, "Order History")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "#signout",
    onClick: signoutHandler
  }, "Sign Out")))) : /*#__PURE__*/React.createElement(Link, {
    to: "/signin"
  }, "Sign In"), userInfo && userInfo.isSeller && /*#__PURE__*/React.createElement("div", {
    className: "dropdown"
  }, /*#__PURE__*/React.createElement(Link, {
    to: "#admin"
  }, "Seller ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-caret-down"
  })), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-content"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/productlist/seller"
  }, "Products")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/orderlist/seller"
  }, "Orders")))), userInfo && userInfo.isAdmin && /*#__PURE__*/React.createElement("div", {
    className: "dropdown"
  }, /*#__PURE__*/React.createElement(Link, {
    to: "#admin"
  }, "Admin ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-caret-down"
  })), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-content"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/dashboard"
  }, "Dashboard")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/productlist"
  }, "Products")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/orderlist"
  }, "Orders")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/userlist"
  }, "Users")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
    to: "/support"
  }, "Support")))))), /*#__PURE__*/React.createElement("aside", {
    className: sidebarIsOpen ? "open" : ""
  }, /*#__PURE__*/React.createElement("ul", {
    className: "categories"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Categories"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarIsOpen(false),
    className: "close-sidebar",
    type: "button"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-close"
  }))), loadingCategories ? /*#__PURE__*/React.createElement(LoadingBox, null) : errorCategories ? /*#__PURE__*/React.createElement(MessageBox, {
    variant: "danger"
  }, errorCategories) : categories.map(c => /*#__PURE__*/React.createElement("li", {
    key: c
  }, /*#__PURE__*/React.createElement(Link, {
    to: `/search/category/${c}`,
    onClick: () => setSidebarIsOpen(false)
  }, c))))), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/seller/:id",
    element: /*#__PURE__*/React.createElement(SellerScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/cart",
    element: /*#__PURE__*/React.createElement(CartScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/cart/:id",
    element: /*#__PURE__*/React.createElement(CartScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/media",
    element: /*#__PURE__*/React.createElement(MediaLibraryScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/games",
    element: /*#__PURE__*/React.createElement(GameLibraryScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/merch",
    element: /*#__PURE__*/React.createElement(HomeScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/contact",
    element: /*#__PURE__*/React.createElement(ContactScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/product/:id",
    element: /*#__PURE__*/React.createElement(ProductScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/product/:id/edit",
    element: /*#__PURE__*/React.createElement(ProductEditScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signin",
    element: /*#__PURE__*/React.createElement(SigninScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/register",
    element: /*#__PURE__*/React.createElement(RegisterScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/shipping",
    element: /*#__PURE__*/React.createElement(ShippingAddressScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/payment",
    element: /*#__PURE__*/React.createElement(PaymentMethodScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/placeorder",
    element: /*#__PURE__*/React.createElement(PlaceOrderScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/order/:id",
    element: /*#__PURE__*/React.createElement(OrderScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/orderhistory",
    element: /*#__PURE__*/React.createElement(OrderHistoryScreen, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/search/name",
    element: /*#__PURE__*/React.createElement(SearchScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/search/name/:name",
    element: /*#__PURE__*/React.createElement(SearchScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/search/category/:category",
    element: /*#__PURE__*/React.createElement(SearchScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/search/category/:category/name/:name",
    element: /*#__PURE__*/React.createElement(SearchScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order/pageNumber/:pageNumber",
    element: /*#__PURE__*/React.createElement(SearchScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/profile",
    element: /*#__PURE__*/React.createElement(PrivateRoute, null, /*#__PURE__*/React.createElement(ProfileScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/map",
    element: /*#__PURE__*/React.createElement(PrivateRoute, null, /*#__PURE__*/React.createElement(MapScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/productlist",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(ProductListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/productlist/pageNumber/:pageNumber",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(ProductListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/orderlist",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(OrderListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/userlist",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(UserListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/user/:id/edit",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(UserEditScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/dashboard",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(DashboardScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/support",
    element: /*#__PURE__*/React.createElement(AdminRoute, null, /*#__PURE__*/React.createElement(SupportScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/productlist/seller",
    element: /*#__PURE__*/React.createElement(SellerRoute, null, /*#__PURE__*/React.createElement(ProductListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/orderlist/seller",
    element: /*#__PURE__*/React.createElement(SellerRoute, null, /*#__PURE__*/React.createElement(OrderListScreen, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(LandingScreen, null),
    exact: true
  }), /*#__PURE__*/React.createElement(Route, {
    path: "*",
    element: /*#__PURE__*/React.createElement(Navigate, {
      to: "/",
      replace: true
    })
  }))), /*#__PURE__*/React.createElement("footer", {
    className: "row center"
  }, userInfo && !userInfo.isAdmin && /*#__PURE__*/React.createElement(ChatBox, {
    userInfo: userInfo
  }), /*#__PURE__*/React.createElement("div", null, "All right reserved"), " ")));
}
export default App;
