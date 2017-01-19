webpackJsonp([8],{

/***/ 1625:
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_get_prototype_of__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_get_prototype_of___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_get_prototype_of__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_core_js_promise__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_core_js_promise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_core_js_promise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_classCallCheck__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_babel_runtime_helpers_createClass__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_babel_runtime_helpers_createClass___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_babel_runtime_helpers_createClass__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_babel_polyfill__ = __webpack_require__(169);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_babel_polyfill___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_babel_polyfill__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_whatwg_fetch__ = __webpack_require__(168);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_whatwg_fetch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_whatwg_fetch__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_es6_promise__ = __webpack_require__(166);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_es6_promise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_es6_promise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_react_dom__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_react_hot_loader__ = __webpack_require__(167);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_react_hot_loader___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11_react_hot_loader__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_react_tap_event_plugin__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_react_tap_event_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12_react_tap_event_plugin__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__secureApi__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__contracts__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__redux__ = __webpack_require__(163);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__ui_ContextProvider__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__ui_Theme__ = __webpack_require__(92);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__util_tx__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__redux_providers_apiActions__ = __webpack_require__(164);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__environment__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__assets_fonts_Roboto_font_css__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__assets_fonts_Roboto_font_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_21__assets_fonts_Roboto_font_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__assets_fonts_RobotoMono_font_css__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__assets_fonts_RobotoMono_font_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_22__assets_fonts_RobotoMono_font_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__views_ParityBar__ = __webpack_require__(162);
 // Copyright 2015, 2016 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.





__WEBPACK_IMPORTED_MODULE_8_es6_promise___default.a.polyfill();






















__WEBPACK_IMPORTED_MODULE_12_react_tap_event_plugin___default()();



// Cleanup Loading
var $container = document.querySelector('#container');
$container.parentNode.removeChild($container);

// Test transport (std transport should be provided as global object)
var FakeTransport = function () {
  function FakeTransport() {__WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_classCallCheck___default()(this, FakeTransport);
    console.warn('Secure Transport not provided. Falling back to FakeTransport');
  }__WEBPACK_IMPORTED_MODULE_5_babel_runtime_helpers_createClass___default()(FakeTransport, [{ key: 'execute', value: function execute(

    method) {for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {params[_key - 1] = arguments[_key];}
      console.log('Calling', method, params);
      return __WEBPACK_IMPORTED_MODULE_3_babel_runtime_core_js_promise___default.a.reject('not connected');
    } }, { key: 'on', value: function on()
    {} }]);return FakeTransport;}();var


FrameSecureApi = function (_SecureApi) {__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits___default()(FrameSecureApi, _SecureApi);
  function FrameSecureApi(transport) {__WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_classCallCheck___default()(this, FrameSecureApi);return __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn___default()(this, (FrameSecureApi.__proto__ || __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_object_get_prototype_of___default()(FrameSecureApi)).call(this,
    '', null, function () {
      return transport;
    }));
  }__WEBPACK_IMPORTED_MODULE_5_babel_runtime_helpers_createClass___default()(FrameSecureApi, [{ key: 'connect', value: function connect()

    {var _this2 = this;
      // Do nothing - this API does not need connecting
      this.emit('connecting');
      // Fire connected event with some delay.
      setTimeout(function () {
        _this2.emit('connected');
      });
    } }, { key: 'needsToken', value: function needsToken()

    {
      return false;
    } }, { key: 'isConnecting', value: function isConnecting()

    {
      return false;
    } }, { key: 'isConnected', value: function isConnected()

    {
      return true;
    } }]);return FrameSecureApi;}(__WEBPACK_IMPORTED_MODULE_13__secureApi__["a" /* default */]);


var api = new FrameSecureApi(window.secureTransport || new FakeTransport());
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_18__util_tx__["a" /* patchApi */])(api);
__WEBPACK_IMPORTED_MODULE_14__contracts__["a" /* default */].create(api);

var store = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_15__redux__["a" /* initStore */])(api, null, true);
store.dispatch({ type: 'initAll', api: api });
store.dispatch(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_19__redux_providers_apiActions__["a" /* setApi */])(api));

window.secureApi = api;

var app =
__WEBPACK_IMPORTED_MODULE_9_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_23__views_ParityBar__["a" /* default */], { dapp: true, externalLink: 'http://127.0.0.1:8180' });


var container = document.createElement('div');
document.body.appendChild(container);

__WEBPACK_IMPORTED_MODULE_10_react_dom___default.a.render(
__WEBPACK_IMPORTED_MODULE_9_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_11_react_hot_loader__["AppContainer"], null,
  __WEBPACK_IMPORTED_MODULE_9_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_16__ui_ContextProvider__["a" /* default */], { api: api, muiTheme: __WEBPACK_IMPORTED_MODULE_17__ui_Theme__["a" /* default */], store: store },
    app)),


container);;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register($container, '$container', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(FakeTransport, 'FakeTransport', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(FrameSecureApi, 'FrameSecureApi', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(api, 'api', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(store, 'store', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(app, 'app', '/home/tomusdrw/eth/parity/js/src/embed.js');__REACT_HOT_LOADER__.register(container, 'container', '/home/tomusdrw/eth/parity/js/src/embed.js');}();;

/***/ },

/***/ 8:
/***/ function(module, exports) {

module.exports = vendor_lib;

/***/ }

},[1625]);
//# sourceMappingURL=embed.d7e36db8c5.js.map