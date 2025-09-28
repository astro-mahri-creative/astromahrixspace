import React, { useEffect, useRef, useState } from "react";
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from "@react-google-maps/api";
import LoadingBox from "../components/LoadingBox";
import Axios from "axios";
import { USER_ADDRESS_MAP_CONFIRM } from "../constants/userConstants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const libs = ["places"];
const defaultLocation = { lat: 45.516, lng: -73.56 };

export { default } from "./MapScreen.jsx";
