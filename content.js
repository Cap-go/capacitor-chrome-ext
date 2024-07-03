"use strict";
/// <reference types="@capacitor/core"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const originalCapacitor = window.Capacitor;
function overrideSafeArea() {
    var _a, _b;
    if (!window.Capacitor) {
        window.Capacitor = {};
    }
    window.Capacitor.getPlatform = () => 'ios';
    window.Capacitor.isNativePlatform = () => true;
    window.Capacitor.isPluginAvailable = () => true;
    window.Capacitor.Plugins = Object.assign(Object.assign({}, window.Capacitor.Plugins), { StatusBar: Object.assign(Object.assign({}, (_a = window.Capacitor.Plugins) === null || _a === void 0 ? void 0 : _a.StatusBar), { getInfo: () => __awaiter(this, void 0, void 0, function* () { return ({ statusBarHeight: 44 }); }) }), SafeArea: Object.assign(Object.assign({}, (_b = window.Capacitor.Plugins) === null || _b === void 0 ? void 0 : _b.SafeArea), { getSafeAreaInsets: () => __awaiter(this, void 0, void 0, function* () {
                return ({
                    insets: {
                        top: 44,
                        right: 0,
                        bottom: 34,
                        left: 0
                    }
                });
            }) }) });
}
overrideSafeArea();
window.addEventListener('resetSafeArea', () => {
    window.Capacitor = originalCapacitor;
});
