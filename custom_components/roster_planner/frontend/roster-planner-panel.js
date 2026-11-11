// \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), t = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.provider"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.iterator;
	function p(e) {
		return typeof e != "object" || !e ? null : (e = f && e[f] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var m = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, h = Object.assign, g = {};
	function _(e, t, n) {
		this.props = e, this.context = t, this.refs = g, this.updater = n || m;
	}
	_.prototype.isReactComponent = {}, _.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, _.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function v() {}
	v.prototype = _.prototype;
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = g, this.updater = n || m;
	}
	var b = y.prototype = new v();
	b.constructor = y, h(b, _.prototype), b.isPureReactComponent = !0;
	var ee = Array.isArray, te = Object.prototype.hasOwnProperty, x = { current: null }, ne = {
		key: !0,
		ref: !0,
		__self: !0,
		__source: !0
	};
	function re(e, n, r) {
		var i, a = {}, o = null, s = null;
		if (n != null) for (i in n.ref !== void 0 && (s = n.ref), n.key !== void 0 && (o = "" + n.key), n) te.call(n, i) && !ne.hasOwnProperty(i) && (a[i] = n[i]);
		var c = arguments.length - 2;
		if (c === 1) a.children = r;
		else if (1 < c) {
			for (var l = Array(c), u = 0; u < c; u++) l[u] = arguments[u + 2];
			a.children = l;
		}
		if (e && e.defaultProps) for (i in c = e.defaultProps, c) a[i] === void 0 && (a[i] = c[i]);
		return {
			$$typeof: t,
			type: e,
			key: o,
			ref: s,
			props: a,
			_owner: x.current
		};
	}
	function ie(e, n) {
		return {
			$$typeof: t,
			type: e.type,
			key: n,
			ref: e.ref,
			props: e.props,
			_owner: e._owner
		};
	}
	function ae(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function oe(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var se = /\/+/g;
	function ce(e, t) {
		return typeof e == "object" && e && e.key != null ? oe("" + e.key) : t.toString(36);
	}
	function le(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n: c = !0;
			}
		}
		if (c) return c = e, o = o(c), e = a === "" ? "." + ce(c, 0) : a, ee(o) ? (i = "", e != null && (i = e.replace(se, "$&/") + "/"), le(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ae(o) && (o = ie(o, i + (!o.key || c && c.key === o.key ? "" : ("" + o.key).replace(se, "$&/") + "/") + e)), r.push(o)), 1;
		if (c = 0, a = a === "" ? "." : a + ":", ee(e)) for (var l = 0; l < e.length; l++) {
			s = e[l];
			var u = a + ce(s, l);
			c += le(s, r, i, u, o);
		}
		else if (u = p(e), typeof u == "function") for (e = u.call(e), l = 0; !(s = e.next()).done;) s = s.value, u = a + ce(s, l++), c += le(s, r, i, u, o);
		else if (s === "object") throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		return c;
	}
	function ue(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return le(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function de(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var S = { current: null }, fe = { transition: null }, pe = {
		ReactCurrentDispatcher: S,
		ReactCurrentBatchConfig: fe,
		ReactCurrentOwner: x
	};
	function me() {
		throw Error("act(...) is not supported in production builds of React.");
	}
	e.Children = {
		map: ue,
		forEach: function(e, t, n) {
			ue(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ue(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ue(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ae(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	}, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = pe, e.act = me, e.cloneElement = function(e, n, r) {
		if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
		var i = h({}, e.props), a = e.key, o = e.ref, s = e._owner;
		if (n != null) {
			if (n.ref !== void 0 && (o = n.ref, s = x.current), n.key !== void 0 && (a = "" + n.key), e.type && e.type.defaultProps) var c = e.type.defaultProps;
			for (l in n) te.call(n, l) && !ne.hasOwnProperty(l) && (i[l] = n[l] === void 0 && c !== void 0 ? c[l] : n[l]);
		}
		var l = arguments.length - 2;
		if (l === 1) i.children = r;
		else if (1 < l) {
			c = Array(l);
			for (var u = 0; u < l; u++) c[u] = arguments[u + 2];
			i.children = c;
		}
		return {
			$$typeof: t,
			type: e.type,
			key: a,
			ref: o,
			props: i,
			_owner: s
		};
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null,
			_defaultValue: null,
			_globalName: null
		}, e.Provider = {
			$$typeof: o,
			_context: e
		}, e.Consumer = e;
	}, e.createElement = re, e.createFactory = function(e) {
		var t = re.bind(null, e);
		return t.type = e, t;
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ae, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: de
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = fe.transition;
		fe.transition = {};
		try {
			e();
		} finally {
			fe.transition = t;
		}
	}, e.unstable_act = me, e.useCallback = function(e, t) {
		return S.current.useCallback(e, t);
	}, e.useContext = function(e) {
		return S.current.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e) {
		return S.current.useDeferredValue(e);
	}, e.useEffect = function(e, t) {
		return S.current.useEffect(e, t);
	}, e.useId = function() {
		return S.current.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return S.current.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return S.current.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return S.current.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return S.current.useMemo(e, t);
	}, e.useReducer = function(e, t, n) {
		return S.current.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return S.current.useRef(e);
	}, e.useState = function(e) {
		return S.current.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return S.current.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return S.current.useTransition();
	}, e.version = "18.3.1";
})), n = /* @__PURE__ */ e(((e, n) => {
	n.exports = t();
})), r = /* @__PURE__ */ e(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = typeof setTimeout == "function" ? setTimeout : null, _ = typeof clearTimeout == "function" ? clearTimeout : null, v = typeof setImmediate < "u" ? setImmediate : null;
	typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
	function y(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function b(e) {
		if (h = !1, y(e), !m) {
			if (n(c) !== null) m = !0, ue(ee);
			else {
				var t = n(l);
				t !== null && de(b, t.startTime - e);
			}
		}
	}
	function ee(t, i) {
		m = !1, h && (h = !1, _(ne), ne = -1), p = !0;
		var a = f;
		try {
			for (y(i), d = n(c); d !== null && (!(d.expirationTime > i) || t && !ae());) {
				var o = d.callback;
				if (typeof o == "function") {
					d.callback = null, f = d.priorityLevel;
					var s = o(d.expirationTime <= i);
					i = e.unstable_now(), typeof s == "function" ? d.callback = s : d === n(c) && r(c), y(i);
				} else r(c);
				d = n(c);
			}
			if (d !== null) var u = !0;
			else {
				var g = n(l);
				g !== null && de(b, g.startTime - i), u = !1;
			}
			return u;
		} finally {
			d = null, f = a, p = !1;
		}
	}
	var te = !1, x = null, ne = -1, re = 5, ie = -1;
	function ae() {
		return !(e.unstable_now() - ie < re);
	}
	function oe() {
		if (x !== null) {
			var t = e.unstable_now();
			ie = t;
			var n = !0;
			try {
				n = x(!0, t);
			} finally {
				n ? se() : (te = !1, x = null);
			}
		} else te = !1;
	}
	var se;
	if (typeof v == "function") se = function() {
		v(oe);
	};
	else if (typeof MessageChannel < "u") {
		var ce = new MessageChannel(), le = ce.port2;
		ce.port1.onmessage = oe, se = function() {
			le.postMessage(null);
		};
	} else se = function() {
		g(oe, 0);
	};
	function ue(e) {
		x = e, te || (te = !0, se());
	}
	function de(t, n) {
		ne = g(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_continueExecution = function() {
		m || p || (m = !0, ue(ee));
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : re = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_getFirstCallbackNode = function() {
		return n(c);
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_pauseExecution = function() {}, e.unstable_requestPaint = function() {}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (_(ne), ne = -1) : h = !0, de(b, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, ue(ee))), r;
	}, e.unstable_shouldYield = ae, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), i = /* @__PURE__ */ e(((e, t) => {
	t.exports = r();
})), a = /* @__PURE__ */ e(((e) => {
	var t = n(), r = i();
	function a(e) {
		for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	var o = /* @__PURE__ */ new Set(), s = {};
	function c(e, t) {
		l(e, t), l(e + "Capture", t);
	}
	function l(e, t) {
		for (s[e] = t, e = 0; e < t.length; e++) o.add(t[e]);
	}
	var u = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, d = Object.prototype.hasOwnProperty, f = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, p = {}, m = {};
	function h(e) {
		return d.call(m, e) ? !0 : d.call(p, e) ? !1 : f.test(e) ? m[e] = !0 : (p[e] = !0, !1);
	}
	function g(e, t, n, r) {
		if (n !== null && n.type === 0) return !1;
		switch (typeof t) {
			case "function":
			case "symbol": return !0;
			case "boolean": return r ? !1 : n === null ? (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-") : !n.acceptsBooleans;
			default: return !1;
		}
	}
	function _(e, t, n, r) {
		if (t == null || g(e, t, n, r)) return !0;
		if (r) return !1;
		if (n !== null) switch (n.type) {
			case 3: return !t;
			case 4: return !1 === t;
			case 5: return isNaN(t);
			case 6: return isNaN(t) || 1 > t;
		}
		return !1;
	}
	function v(e, t, n, r, i, a, o) {
		this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = a, this.removeEmptyString = o;
	}
	var y = {};
	"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
		y[e] = new v(e, 0, !1, e, null, !1, !1);
	}), [
		["acceptCharset", "accept-charset"],
		["className", "class"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"]
	].forEach(function(e) {
		var t = e[0];
		y[t] = new v(t, 1, !1, e[1], null, !1, !1);
	}), [
		"contentEditable",
		"draggable",
		"spellCheck",
		"value"
	].forEach(function(e) {
		y[e] = new v(e, 2, !1, e.toLowerCase(), null, !1, !1);
	}), [
		"autoReverse",
		"externalResourcesRequired",
		"focusable",
		"preserveAlpha"
	].forEach(function(e) {
		y[e] = new v(e, 2, !1, e, null, !1, !1);
	}), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
		y[e] = new v(e, 3, !1, e.toLowerCase(), null, !1, !1);
	}), [
		"checked",
		"multiple",
		"muted",
		"selected"
	].forEach(function(e) {
		y[e] = new v(e, 3, !0, e, null, !1, !1);
	}), ["capture", "download"].forEach(function(e) {
		y[e] = new v(e, 4, !1, e, null, !1, !1);
	}), [
		"cols",
		"rows",
		"size",
		"span"
	].forEach(function(e) {
		y[e] = new v(e, 6, !1, e, null, !1, !1);
	}), ["rowSpan", "start"].forEach(function(e) {
		y[e] = new v(e, 5, !1, e.toLowerCase(), null, !1, !1);
	});
	var b = /[\-:]([a-z])/g;
	function ee(e) {
		return e[1].toUpperCase();
	}
	"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
		var t = e.replace(b, ee);
		y[t] = new v(t, 1, !1, e, null, !1, !1);
	}), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
		var t = e.replace(b, ee);
		y[t] = new v(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
	}), [
		"xml:base",
		"xml:lang",
		"xml:space"
	].forEach(function(e) {
		var t = e.replace(b, ee);
		y[t] = new v(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
	}), ["tabIndex", "crossOrigin"].forEach(function(e) {
		y[e] = new v(e, 1, !1, e.toLowerCase(), null, !1, !1);
	}), y.xlinkHref = new v("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), [
		"src",
		"href",
		"action",
		"formAction"
	].forEach(function(e) {
		y[e] = new v(e, 1, !1, e.toLowerCase(), null, !0, !0);
	});
	function te(e, t, n, r) {
		var i = y.hasOwnProperty(t) ? y[t] : null;
		(i === null ? r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N" : i.type !== 0) && (_(t, n, i, r) && (n = null), r || i === null ? h(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type !== 3 && "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (i = i.type, n = i === 3 || i === 4 && !0 === n ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
	}
	var x = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ne = Symbol.for("react.element"), re = Symbol.for("react.portal"), ie = Symbol.for("react.fragment"), ae = Symbol.for("react.strict_mode"), oe = Symbol.for("react.profiler"), se = Symbol.for("react.provider"), ce = Symbol.for("react.context"), le = Symbol.for("react.forward_ref"), ue = Symbol.for("react.suspense"), de = Symbol.for("react.suspense_list"), S = Symbol.for("react.memo"), fe = Symbol.for("react.lazy"), pe = Symbol.for("react.offscreen"), me = Symbol.iterator;
	function he(e) {
		return typeof e != "object" || !e ? null : (e = me && e[me] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var C = Object.assign, ge;
	function _e(e) {
		if (ge === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ge = t && t[1] || "";
		}
		return "\n" + ge + e;
	}
	var ve = !1;
	function ye(e, t) {
		if (!e || ve) return "";
		ve = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			if (t) {
				if (t = function() {
					throw Error();
				}, Object.defineProperty(t.prototype, "props", { set: function() {
					throw Error();
				} }), typeof Reflect == "object" && Reflect.construct) {
					try {
						Reflect.construct(t, []);
					} catch (e) {
						var r = e;
					}
					Reflect.construct(e, [], t);
				} else {
					try {
						t.call();
					} catch (e) {
						r = e;
					}
					e.call(t.prototype);
				}
			} else {
				try {
					throw Error();
				} catch (e) {
					r = e;
				}
				e();
			}
		} catch (t) {
			if (t && r && typeof t.stack == "string") {
				for (var i = t.stack.split("\n"), a = r.stack.split("\n"), o = i.length - 1, s = a.length - 1; 1 <= o && 0 <= s && i[o] !== a[s];) s--;
				for (; 1 <= o && 0 <= s; o--, s--) if (i[o] !== a[s]) {
					if (o !== 1 || s !== 1) do
						if (o--, s--, 0 > s || i[o] !== a[s]) {
							var c = "\n" + i[o].replace(" at new ", " at ");
							return e.displayName && c.includes("<anonymous>") && (c = c.replace("<anonymous>", e.displayName)), c;
						}
					while (1 <= o && 0 <= s);
					break;
				}
			}
		} finally {
			ve = !1, Error.prepareStackTrace = n;
		}
		return (e = e ? e.displayName || e.name : "") ? _e(e) : "";
	}
	function be(e) {
		switch (e.tag) {
			case 5: return _e(e.type);
			case 16: return _e("Lazy");
			case 13: return _e("Suspense");
			case 19: return _e("SuspenseList");
			case 0:
			case 2:
			case 15: return e = ye(e.type, !1), e;
			case 11: return e = ye(e.type.render, !1), e;
			case 1: return e = ye(e.type, !0), e;
			default: return "";
		}
	}
	function xe(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case ie: return "Fragment";
			case re: return "Portal";
			case oe: return "Profiler";
			case ae: return "StrictMode";
			case ue: return "Suspense";
			case de: return "SuspenseList";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case ce: return (e.displayName || "Context") + ".Consumer";
			case se: return (e._context.displayName || "Context") + ".Provider";
			case le:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case S: return t = e.displayName || null, t === null ? xe(e.type) || "Memo" : t;
			case fe:
				t = e._payload, e = e._init;
				try {
					return xe(e(t));
				} catch {}
		}
		return null;
	}
	function Se(e) {
		var t = e.type;
		switch (e.tag) {
			case 24: return "Cache";
			case 9: return (t.displayName || "Context") + ".Consumer";
			case 10: return (t._context.displayName || "Context") + ".Provider";
			case 18: return "DehydratedFragment";
			case 11: return e = t.render, e = e.displayName || e.name || "", t.displayName || (e === "" ? "ForwardRef" : "ForwardRef(" + e + ")");
			case 7: return "Fragment";
			case 5: return t;
			case 4: return "Portal";
			case 3: return "Root";
			case 6: return "Text";
			case 16: return xe(t);
			case 8: return t === ae ? "StrictMode" : "Mode";
			case 22: return "Offscreen";
			case 12: return "Profiler";
			case 21: return "Scope";
			case 13: return "Suspense";
			case 19: return "SuspenseList";
			case 25: return "TracingMarker";
			case 1:
			case 0:
			case 17:
			case 2:
			case 14:
			case 15:
				if (typeof t == "function") return t.displayName || t.name || null;
				if (typeof t == "string") return t;
		}
		return null;
	}
	function Ce(e) {
		switch (typeof e) {
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function we(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Te(e) {
		var t = we(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
		if (!e.hasOwnProperty(t) && n !== void 0 && typeof n.get == "function" && typeof n.set == "function") {
			var i = n.get, a = n.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					r = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: n.enumerable }), {
				getValue: function() {
					return r;
				},
				setValue: function(e) {
					r = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Ee(e) {
		e._valueTracker ||= Te(e);
	}
	function w(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = we(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function De(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Oe(e, t) {
		var n = t.checked;
		return C({}, t, {
			defaultChecked: void 0,
			defaultValue: void 0,
			value: void 0,
			checked: n ?? e._wrapperState.initialChecked
		});
	}
	function ke(e, t) {
		var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked == null ? t.defaultChecked : t.checked;
		n = Ce(t.value == null ? n : t.value), e._wrapperState = {
			initialChecked: r,
			initialValue: n,
			controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
		};
	}
	function Ae(e, t) {
		t = t.checked, t != null && te(e, "checked", t, !1);
	}
	function je(e, t) {
		Ae(e, t);
		var n = Ce(t.value), r = t.type;
		if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
		else if (r === "submit" || r === "reset") {
			e.removeAttribute("value");
			return;
		}
		t.hasOwnProperty("value") ? Ne(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ne(e, t.type, Ce(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
	}
	function Me(e, t, n) {
		if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
			var r = t.type;
			if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
			t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
		}
		n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
	}
	function Ne(e, t, n) {
		(t !== "number" || De(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
	}
	var Pe = Array.isArray;
	function Fe(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Ce(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Ie(e, t) {
		if (t.dangerouslySetInnerHTML != null) throw Error(a(91));
		return C({}, t, {
			value: void 0,
			defaultValue: void 0,
			children: "" + e._wrapperState.initialValue
		});
	}
	function Le(e, t) {
		var n = t.value;
		if (n == null) {
			if (n = t.children, t = t.defaultValue, n != null) {
				if (t != null) throw Error(a(92));
				if (Pe(n)) {
					if (1 < n.length) throw Error(a(93));
					n = n[0];
				}
				t = n;
			}
			t ??= "", n = t;
		}
		e._wrapperState = { initialValue: Ce(n) };
	}
	function Re(e, t) {
		var n = Ce(t.value), r = Ce(t.defaultValue);
		n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
	}
	function ze(e) {
		var t = e.textContent;
		t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
	}
	function Be(e) {
		switch (e) {
			case "svg": return "http://www.w3.org/2000/svg";
			case "math": return "http://www.w3.org/1998/Math/MathML";
			default: return "http://www.w3.org/1999/xhtml";
		}
	}
	function Ve(e, t) {
		return e == null || e === "http://www.w3.org/1999/xhtml" ? Be(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
	}
	var He, Ue = function(e) {
		return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
			MSApp.execUnsafeLocalFunction(function() {
				return e(t, n, r, i);
			});
		} : e;
	}(function(e, t) {
		if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
		else {
			for (He ||= document.createElement("div"), He.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = He.firstChild; e.firstChild;) e.removeChild(e.firstChild);
			for (; t.firstChild;) e.appendChild(t.firstChild);
		}
	});
	function We(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Ge = {
		animationIterationCount: !0,
		aspectRatio: !0,
		borderImageOutset: !0,
		borderImageSlice: !0,
		borderImageWidth: !0,
		boxFlex: !0,
		boxFlexGroup: !0,
		boxOrdinalGroup: !0,
		columnCount: !0,
		columns: !0,
		flex: !0,
		flexGrow: !0,
		flexPositive: !0,
		flexShrink: !0,
		flexNegative: !0,
		flexOrder: !0,
		gridArea: !0,
		gridRow: !0,
		gridRowEnd: !0,
		gridRowSpan: !0,
		gridRowStart: !0,
		gridColumn: !0,
		gridColumnEnd: !0,
		gridColumnSpan: !0,
		gridColumnStart: !0,
		fontWeight: !0,
		lineClamp: !0,
		lineHeight: !0,
		opacity: !0,
		order: !0,
		orphans: !0,
		tabSize: !0,
		widows: !0,
		zIndex: !0,
		zoom: !0,
		fillOpacity: !0,
		floodOpacity: !0,
		stopOpacity: !0,
		strokeDasharray: !0,
		strokeDashoffset: !0,
		strokeMiterlimit: !0,
		strokeOpacity: !0,
		strokeWidth: !0
	}, Ke = [
		"Webkit",
		"ms",
		"Moz",
		"O"
	];
	Object.keys(Ge).forEach(function(e) {
		Ke.forEach(function(t) {
			t = t + e.charAt(0).toUpperCase() + e.substring(1), Ge[t] = Ge[e];
		});
	});
	function qe(e, t, n) {
		return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Ge.hasOwnProperty(e) && Ge[e] ? ("" + t).trim() : t + "px";
	}
	function Je(e, t) {
		for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
			var r = n.indexOf("--") === 0, i = qe(n, t[n], r);
			n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
		}
	}
	var Ye = C({ menuitem: !0 }, {
		area: !0,
		base: !0,
		br: !0,
		col: !0,
		embed: !0,
		hr: !0,
		img: !0,
		input: !0,
		keygen: !0,
		link: !0,
		meta: !0,
		param: !0,
		source: !0,
		track: !0,
		wbr: !0
	});
	function Xe(e, t) {
		if (t) {
			if (Ye[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(a(137, e));
			if (t.dangerouslySetInnerHTML != null) {
				if (t.children != null) throw Error(a(60));
				if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(a(61));
			}
			if (t.style != null && typeof t.style != "object") throw Error(a(62));
		}
	}
	function Ze(e, t) {
		if (e.indexOf("-") === -1) return typeof t.is == "string";
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Qe = null;
	function $e(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var et = null, tt = null, nt = null;
	function rt(e) {
		if (e = Ji(e)) {
			if (typeof et != "function") throw Error(a(280));
			var t = e.stateNode;
			t && (t = Xi(t), et(e.stateNode, e.type, t));
		}
	}
	function it(e) {
		tt ? nt ? nt.push(e) : nt = [e] : tt = e;
	}
	function at() {
		if (tt) {
			var e = tt, t = nt;
			if (nt = tt = null, rt(e), t) for (e = 0; e < t.length; e++) rt(t[e]);
		}
	}
	function ot(e, t) {
		return e(t);
	}
	function st() {}
	var ct = !1;
	function lt(e, t, n) {
		if (ct) return e(t, n);
		ct = !0;
		try {
			return ot(e, t, n);
		} finally {
			ct = !1, (tt !== null || nt !== null) && (st(), at());
		}
	}
	function ut(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = Xi(n);
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(a(231, t, typeof n));
		return n;
	}
	var dt = !1;
	if (u) try {
		var ft = {};
		Object.defineProperty(ft, "passive", { get: function() {
			dt = !0;
		} }), window.addEventListener("test", ft, ft), window.removeEventListener("test", ft, ft);
	} catch {
		dt = !1;
	}
	function pt(e, t, n, r, i, a, o, s, c) {
		var l = Array.prototype.slice.call(arguments, 3);
		try {
			t.apply(n, l);
		} catch (e) {
			this.onError(e);
		}
	}
	var mt = !1, ht = null, T = !1, gt = null, _t = { onError: function(e) {
		mt = !0, ht = e;
	} };
	function vt(e, t, n, r, i, a, o, s, c) {
		mt = !1, ht = null, pt.apply(_t, arguments);
	}
	function yt(e, t, n, r, i, o, s, c, l) {
		if (vt.apply(this, arguments), mt) {
			if (mt) {
				var u = ht;
				mt = !1, ht = null;
			} else throw Error(a(198));
			T || (T = !0, gt = u);
		}
	}
	function bt(e) {
		var t = e, n = e;
		if (e.alternate) for (; t.return;) t = t.return;
		else {
			e = t;
			do
				t = e, t.flags & 4098 && (n = t.return), e = t.return;
			while (e);
		}
		return t.tag === 3 ? n : null;
	}
	function xt(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function St(e) {
		if (bt(e) !== e) throw Error(a(188));
	}
	function Ct(e) {
		var t = e.alternate;
		if (!t) {
			if (t = bt(e), t === null) throw Error(a(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var o = i.alternate;
			if (o === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === o.child) {
				for (o = i.child; o;) {
					if (o === n) return St(i), e;
					if (o === r) return St(i), t;
					o = o.sibling;
				}
				throw Error(a(188));
			}
			if (n.return !== r.return) n = i, r = o;
			else {
				for (var s = !1, c = i.child; c;) {
					if (c === n) {
						s = !0, n = i, r = o;
						break;
					}
					if (c === r) {
						s = !0, r = i, n = o;
						break;
					}
					c = c.sibling;
				}
				if (!s) {
					for (c = o.child; c;) {
						if (c === n) {
							s = !0, n = o, r = i;
							break;
						}
						if (c === r) {
							s = !0, r = o, n = i;
							break;
						}
						c = c.sibling;
					}
					if (!s) throw Error(a(189));
				}
			}
			if (n.alternate !== r) throw Error(a(190));
		}
		if (n.tag !== 3) throw Error(a(188));
		return n.stateNode.current === n ? e : t;
	}
	function wt(e) {
		return e = Ct(e), e === null ? null : Tt(e);
	}
	function Tt(e) {
		if (e.tag === 5 || e.tag === 6) return e;
		for (e = e.child; e !== null;) {
			var t = Tt(e);
			if (t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var E = r.unstable_scheduleCallback, Et = r.unstable_cancelCallback, Dt = r.unstable_shouldYield, Ot = r.unstable_requestPaint, D = r.unstable_now, kt = r.unstable_getCurrentPriorityLevel, At = r.unstable_ImmediatePriority, jt = r.unstable_UserBlockingPriority, Mt = r.unstable_NormalPriority, Nt = r.unstable_LowPriority, O = r.unstable_IdlePriority, Pt = null, Ft = null;
	function It(e) {
		if (Ft && typeof Ft.onCommitFiberRoot == "function") try {
			Ft.onCommitFiberRoot(Pt, e, void 0, (e.current.flags & 128) == 128);
		} catch {}
	}
	var Lt = Math.clz32 ? Math.clz32 : Bt, Rt = Math.log, zt = Math.LN2;
	function Bt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Rt(e) / zt | 0) | 0;
	}
	var Vt = 64, Ht = 4194304;
	function Ut(e) {
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 4194240;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
			case 67108864: return e & 130023424;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 1073741824;
			default: return e;
		}
	}
	function Wt(e, t) {
		var n = e.pendingLanes;
		if (n === 0) return 0;
		var r = 0, i = e.suspendedLanes, a = e.pingedLanes, o = n & 268435455;
		if (o !== 0) {
			var s = o & ~i;
			s === 0 ? (a &= o, a !== 0 && (r = Ut(a))) : r = Ut(s);
		} else o = n & ~i, o === 0 ? a !== 0 && (r = Ut(a)) : r = Ut(o);
		if (r === 0) return 0;
		if (t !== 0 && t !== r && (t & i) === 0 && (i = r & -r, a = t & -t, i >= a || i === 16 && a & 4194240)) return t;
		if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - Lt(t), i = 1 << n, r |= e[n], t &= ~i;
		return r;
	}
	function Gt(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4: return t + 250;
			case 8:
			case 16:
			case 32:
			case 64:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
			case 67108864: return -1;
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function Kt(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes; 0 < a;) {
			var o = 31 - Lt(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Gt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
	}
	function qt(e) {
		return e = e.pendingLanes & -1073741825, e === 0 ? e & 1073741824 ? 1073741824 : 0 : e;
	}
	function Jt() {
		var e = Vt;
		return Vt <<= 1, !(Vt & 4194240) && (Vt = 64), e;
	}
	function Yt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Xt(e, t, n) {
		e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Lt(t), e[t] = n;
	}
	function Zt(e, t) {
		var n = e.pendingLanes & ~t;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
		var r = e.eventTimes;
		for (e = e.expirationTimes; 0 < n;) {
			var i = 31 - Lt(n), a = 1 << i;
			t[i] = 0, r[i] = -1, e[i] = -1, n &= ~a;
		}
	}
	function Qt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Lt(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	var k = 0;
	function $t(e) {
		return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
	}
	var en, tn, A, nn, rn, an = !1, on = [], sn = null, cn = null, ln = null, un = /* @__PURE__ */ new Map(), dn = /* @__PURE__ */ new Map(), j = [], fn = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
	function pn(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				sn = null;
				break;
			case "dragenter":
			case "dragleave":
				cn = null;
				break;
			case "mouseover":
			case "mouseout":
				ln = null;
				break;
			case "pointerover":
			case "pointerout":
				un.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": dn.delete(t.pointerId);
		}
	}
	function mn(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Ji(t), t !== null && tn(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function hn(e, t, n, r, i) {
		switch (t) {
			case "focusin": return sn = mn(sn, e, t, n, r, i), !0;
			case "dragenter": return cn = mn(cn, e, t, n, r, i), !0;
			case "mouseover": return ln = mn(ln, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return un.set(a, mn(un.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, dn.set(a, mn(dn.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function M(e) {
		var t = qi(e.target);
		if (t !== null) {
			var n = bt(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = xt(n), t !== null) {
						e.blockedOn = t, rn(e.priority, function() {
							A(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function gn(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = En(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Qe = r, n.target.dispatchEvent(r), Qe = null;
			} else return t = Ji(n), t !== null && tn(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function N(e, t, n) {
		gn(e) && n.delete(t);
	}
	function _n() {
		an = !1, sn !== null && gn(sn) && (sn = null), cn !== null && gn(cn) && (cn = null), ln !== null && gn(ln) && (ln = null), un.forEach(N), dn.forEach(N);
	}
	function vn(e, t) {
		e.blockedOn === t && (e.blockedOn = null, an || (an = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, _n)));
	}
	function yn(e) {
		function t(t) {
			return vn(t, e);
		}
		if (0 < on.length) {
			vn(on[0], e);
			for (var n = 1; n < on.length; n++) {
				var r = on[n];
				r.blockedOn === e && (r.blockedOn = null);
			}
		}
		for (sn !== null && vn(sn, e), cn !== null && vn(cn, e), ln !== null && vn(ln, e), un.forEach(t), dn.forEach(t), n = 0; n < j.length; n++) r = j[n], r.blockedOn === e && (r.blockedOn = null);
		for (; 0 < j.length && (n = j[0], n.blockedOn === null);) M(n), n.blockedOn === null && j.shift();
	}
	var bn = x.ReactCurrentBatchConfig, xn = !0;
	function Sn(e, t, n, r) {
		var i = k, a = bn.transition;
		bn.transition = null;
		try {
			k = 1, wn(e, t, n, r);
		} finally {
			k = i, bn.transition = a;
		}
	}
	function Cn(e, t, n, r) {
		var i = k, a = bn.transition;
		bn.transition = null;
		try {
			k = 4, wn(e, t, n, r);
		} finally {
			k = i, bn.transition = a;
		}
	}
	function wn(e, t, n, r) {
		if (xn) {
			var i = En(e, t, n, r);
			if (i === null) yi(e, t, r, Tn, n), pn(e, r);
			else if (hn(i, e, t, n, r)) r.stopPropagation();
			else if (pn(e, r), t & 4 && -1 < fn.indexOf(e)) {
				for (; i !== null;) {
					var a = Ji(i);
					if (a !== null && en(a), a = En(e, t, n, r), a === null && yi(e, t, r, Tn, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else yi(e, t, r, null, n);
		}
	}
	var Tn = null;
	function En(e, t, n, r) {
		if (Tn = null, e = $e(r), e = qi(e), e !== null) {
			if (t = bt(e), t === null) e = null;
			else if (n = t.tag, n === 13) {
				if (e = xt(t), e !== null) return e;
				e = null;
			} else if (n === 3) {
				if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
				e = null;
			} else t !== e && (e = null);
		}
		return Tn = e, null;
	}
	function Dn(e) {
		switch (e) {
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 1;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "toggle":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 4;
			case "message": switch (kt()) {
				case At: return 1;
				case jt: return 4;
				case Mt:
				case Nt: return 16;
				case O: return 536870912;
				default: return 16;
			}
			default: return 16;
		}
	}
	var On = null, kn = null, An = null;
	function jn() {
		if (An) return An;
		var e, t = kn, n = t.length, r, i = "value" in On ? On.value : On.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return An = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Mn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Nn() {
		return !0;
	}
	function Pn() {
		return !1;
	}
	function Fn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Nn : Pn, this.isPropagationStopped = Pn, this;
		}
		return C(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Nn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Nn);
			},
			persist: function() {},
			isPersistent: Nn
		}), t;
	}
	var In = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Ln = Fn(In), Rn = C({}, In, {
		view: 0,
		detail: 0
	}), zn = Fn(Rn), Bn, Vn, Hn, Un = C({}, Rn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: er,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Hn && (Hn && e.type === "mousemove" ? (Bn = e.screenX - Hn.screenX, Vn = e.screenY - Hn.screenY) : Vn = Bn = 0, Hn = e), Bn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Vn;
		}
	}), Wn = Fn(Un), Gn = Fn(C({}, Un, { dataTransfer: 0 })), Kn = Fn(C({}, Rn, { relatedTarget: 0 })), qn = Fn(C({}, In, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Jn = Fn(C({}, In, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Yn = Fn(C({}, In, { data: 0 })), Xn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, Zn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, Qn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function $n(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Qn[e]) ? !!t[e] : !1;
	}
	function er() {
		return $n;
	}
	var tr = Fn(C({}, Rn, {
		key: function(e) {
			if (e.key) {
				var t = Xn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Mn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Zn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: er,
		charCode: function(e) {
			return e.type === "keypress" ? Mn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Mn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), nr = Fn(C({}, Un, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), rr = Fn(C({}, Rn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: er
	})), ir = Fn(C({}, In, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), ar = Fn(C({}, Un, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), or = [
		9,
		13,
		27,
		32
	], sr = u && "CompositionEvent" in window, cr = null;
	u && "documentMode" in document && (cr = document.documentMode);
	var lr = u && "TextEvent" in window && !cr, ur = u && (!sr || cr && 8 < cr && 11 >= cr), dr = " ", fr = !1;
	function pr(e, t) {
		switch (e) {
			case "keyup": return or.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function mr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var hr = !1;
	function gr(e, t) {
		switch (e) {
			case "compositionend": return mr(t);
			case "keypress": return t.which === 32 ? (fr = !0, dr) : null;
			case "textInput": return e = t.data, e === dr && fr ? null : e;
			default: return null;
		}
	}
	function _r(e, t) {
		if (hr) return e === "compositionend" || !sr && pr(e, t) ? (e = jn(), An = kn = On = null, hr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return ur && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var vr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function yr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!vr[e.type] : t === "textarea";
	}
	function br(e, t, n, r) {
		it(r), t = xi(t, "onChange"), 0 < t.length && (n = new Ln("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var xr = null, Sr = null;
	function Cr(e) {
		mi(e, 0);
	}
	function wr(e) {
		if (w(Yi(e))) return e;
	}
	function Tr(e, t) {
		if (e === "change") return t;
	}
	var Er = !1;
	if (u) {
		var Dr;
		if (u) {
			var Or = "oninput" in document;
			if (!Or) {
				var kr = document.createElement("div");
				kr.setAttribute("oninput", "return;"), Or = typeof kr.oninput == "function";
			}
			Dr = Or;
		} else Dr = !1;
		Er = Dr && (!document.documentMode || 9 < document.documentMode);
	}
	function Ar() {
		xr && (xr.detachEvent("onpropertychange", jr), Sr = xr = null);
	}
	function jr(e) {
		if (e.propertyName === "value" && wr(Sr)) {
			var t = [];
			br(t, Sr, e, $e(e)), lt(Cr, t);
		}
	}
	function Mr(e, t, n) {
		e === "focusin" ? (Ar(), xr = t, Sr = n, xr.attachEvent("onpropertychange", jr)) : e === "focusout" && Ar();
	}
	function Nr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return wr(Sr);
	}
	function Pr(e, t) {
		if (e === "click") return wr(t);
	}
	function Fr(e, t) {
		if (e === "input" || e === "change") return wr(t);
	}
	function Ir(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Lr = typeof Object.is == "function" ? Object.is : Ir;
	function Rr(e, t) {
		if (Lr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!d.call(t, i) || !Lr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function zr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Br(e, t) {
		var n = zr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = zr(n);
		}
	}
	function Vr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Vr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Hr() {
		for (var e = window, t = De(); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = De(e.document);
		}
		return t;
	}
	function Ur(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	function Wr(e) {
		var t = Hr(), n = e.focusedElem, r = e.selectionRange;
		if (t !== n && n && n.ownerDocument && Vr(n.ownerDocument.documentElement, n)) {
			if (r !== null && Ur(n)) {
				if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
				else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
					e = e.getSelection();
					var i = n.textContent.length, a = Math.min(r.start, i);
					r = r.end === void 0 ? a : Math.min(r.end, i), !e.extend && a > r && (i = r, r = a, a = i), i = Br(n, a);
					var o = Br(n, r);
					i && o && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(i.node, i.offset), e.removeAllRanges(), a > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
				}
			}
			for (t = [], e = n; e = e.parentNode;) e.nodeType === 1 && t.push({
				element: e,
				left: e.scrollLeft,
				top: e.scrollTop
			});
			for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
		}
	}
	var Gr = u && "documentMode" in document && 11 >= document.documentMode, Kr = null, qr = null, Jr = null, Yr = !1;
	function Xr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Yr || Kr == null || Kr !== De(r) || (r = Kr, "selectionStart" in r && Ur(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Jr && Rr(Jr, r) || (Jr = r, r = xi(qr, "onSelect"), 0 < r.length && (t = new Ln("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Kr)));
	}
	function Zr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Qr = {
		animationend: Zr("Animation", "AnimationEnd"),
		animationiteration: Zr("Animation", "AnimationIteration"),
		animationstart: Zr("Animation", "AnimationStart"),
		transitionend: Zr("Transition", "TransitionEnd")
	}, $r = {}, ei = {};
	u && (ei = document.createElement("div").style, "AnimationEvent" in window || (delete Qr.animationend.animation, delete Qr.animationiteration.animation, delete Qr.animationstart.animation), "TransitionEvent" in window || delete Qr.transitionend.transition);
	function ti(e) {
		if ($r[e]) return $r[e];
		if (!Qr[e]) return e;
		var t = Qr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ei) return $r[e] = t[n];
		return e;
	}
	var ni = ti("animationend"), ri = ti("animationiteration"), ii = ti("animationstart"), ai = ti("transitionend"), oi = /* @__PURE__ */ new Map(), si = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	function ci(e, t) {
		oi.set(e, t), c(t, [e]);
	}
	for (var li = 0; li < si.length; li++) {
		var ui = si[li];
		ci(ui.toLowerCase(), "on" + (ui[0].toUpperCase() + ui.slice(1)));
	}
	ci(ni, "onAnimationEnd"), ci(ri, "onAnimationIteration"), ci(ii, "onAnimationStart"), ci("dblclick", "onDoubleClick"), ci("focusin", "onFocus"), ci("focusout", "onBlur"), ci(ai, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var di = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), fi = new Set("cancel close invalid load scroll toggle".split(" ").concat(di));
	function pi(e, t, n) {
		var r = e.type || "unknown-event";
		e.currentTarget = n, yt(r, t, void 0, e), e.currentTarget = null;
	}
	function mi(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					pi(i, s, l), a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					pi(i, s, l), a = c;
				}
			}
		}
		if (T) throw e = gt, T = !1, gt = null, e;
	}
	function P(e, t) {
		var n = t[Wi];
		n === void 0 && (n = t[Wi] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (vi(t, e, 2, !1), n.add(r));
	}
	function hi(e, t, n) {
		var r = 0;
		t && (r |= 4), vi(n, e, r, t);
	}
	var gi = "_reactListening" + Math.random().toString(36).slice(2);
	function _i(e) {
		if (!e[gi]) {
			e[gi] = !0, o.forEach(function(t) {
				t !== "selectionchange" && (fi.has(t) || hi(t, !1, e), hi(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[gi] || (t[gi] = !0, hi("selectionchange", !1, t));
		}
	}
	function vi(e, t, n, r) {
		switch (Dn(t)) {
			case 1:
				var i = Sn;
				break;
			case 4:
				i = Cn;
				break;
			default: i = wn;
		}
		n = i.bind(null, t, n, e), i = void 0, !dt || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function yi(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i || s.nodeType === 8 && s.parentNode === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && (c = o.stateNode.containerInfo, c === i || c.nodeType === 8 && c.parentNode === i)) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = qi(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		lt(function() {
			var r = a, i = $e(n), o = [];
			a: {
				var s = oi.get(e);
				if (s !== void 0) {
					var c = Ln, l = e;
					switch (e) {
						case "keypress": if (Mn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = tr;
							break;
						case "focusin":
							l = "focus", c = Kn;
							break;
						case "focusout":
							l = "blur", c = Kn;
							break;
						case "beforeblur":
						case "afterblur":
							c = Kn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = Wn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Gn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = rr;
							break;
						case ni:
						case ri:
						case ii:
							c = qn;
							break;
						case ai:
							c = ir;
							break;
						case "scroll":
							c = zn;
							break;
						case "wheel":
							c = ar;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Jn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup": c = nr;
					}
					var u = !!(t & 4), d = !u && e === "scroll", f = u ? s === null ? null : s + "Capture" : s;
					u = [];
					for (var p = r, m; p !== null;) {
						m = p;
						var h = m.stateNode;
						if (m.tag === 5 && h !== null && (m = h, f !== null && (h = ut(p, f), h != null && u.push(bi(p, h, m)))), d) break;
						p = p.return;
					}
					0 < u.length && (s = new c(s, l, null, n, i), o.push({
						event: s,
						listeners: u
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Qe && (l = n.relatedTarget || n.fromElement) && (qi(l) || l[Ui])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? qi(l) : null, l !== null && (d = bt(l), l !== d || l.tag !== 5 && l.tag !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (u = Wn, h = "onMouseLeave", f = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (u = nr, h = "onPointerLeave", f = "onPointerEnter", p = "pointer"), d = c == null ? s : Yi(c), m = l == null ? s : Yi(l), s = new u(h, p + "leave", c, n, i), s.target = d, s.relatedTarget = m, h = null, qi(i) === r && (u = new u(f, p + "enter", l, n, i), u.target = m, u.relatedTarget = d, h = u), d = h, c && l) b: {
							for (u = c, f = l, p = 0, m = u; m; m = Si(m)) p++;
							for (m = 0, h = f; h; h = Si(h)) m++;
							for (; 0 < p - m;) u = Si(u), p--;
							for (; 0 < m - p;) f = Si(f), m--;
							for (; p--;) {
								if (u === f || f !== null && u === f.alternate) break b;
								u = Si(u), f = Si(f);
							}
							u = null;
						}
						else u = null;
						c !== null && Ci(o, s, c, u, !1), l !== null && d !== null && Ci(o, d, l, u, !0);
					}
				}
				a: {
					if (s = r ? Yi(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var g = Tr;
					else if (yr(s)) {
						if (Er) g = Fr;
						else {
							g = Nr;
							var _ = Mr;
						}
					} else (c = s.nodeName) && c.toLowerCase() === "input" && (s.type === "checkbox" || s.type === "radio") && (g = Pr);
					if (g &&= g(e, r)) {
						br(o, g, n, i);
						break a;
					}
					_ && _(e, s, r), e === "focusout" && (_ = s._wrapperState) && _.controlled && s.type === "number" && Ne(s, "number", s.value);
				}
				switch (_ = r ? Yi(r) : window, e) {
					case "focusin":
						(yr(_) || _.contentEditable === "true") && (Kr = _, qr = r, Jr = null);
						break;
					case "focusout":
						Jr = qr = Kr = null;
						break;
					case "mousedown":
						Yr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Yr = !1, Xr(o, n, i);
						break;
					case "selectionchange": if (Gr) break;
					case "keydown":
					case "keyup": Xr(o, n, i);
				}
				var v;
				if (sr) b: {
					switch (e) {
						case "compositionstart":
							var y = "onCompositionStart";
							break b;
						case "compositionend":
							y = "onCompositionEnd";
							break b;
						case "compositionupdate":
							y = "onCompositionUpdate";
							break b;
					}
					y = void 0;
				}
				else hr ? pr(e, n) && (y = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (y = "onCompositionStart");
				y && (ur && n.locale !== "ko" && (hr || y !== "onCompositionStart" ? y === "onCompositionEnd" && hr && (v = jn()) : (On = i, kn = "value" in On ? On.value : On.textContent, hr = !0)), _ = xi(r, y), 0 < _.length && (y = new Yn(y, e, null, n, i), o.push({
					event: y,
					listeners: _
				}), v ? y.data = v : (v = mr(n), v !== null && (y.data = v)))), (v = lr ? gr(e, n) : _r(e, n)) && (r = xi(r, "onBeforeInput"), 0 < r.length && (i = new Yn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: i,
					listeners: r
				}), i.data = v));
			}
			mi(o, t);
		});
	}
	function bi(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function xi(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			i.tag === 5 && a !== null && (i = a, a = ut(e, n), a != null && r.unshift(bi(e, a, i)), a = ut(e, t), a != null && r.push(bi(e, a, i))), e = e.return;
		}
		return r;
	}
	function Si(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5);
		return e || null;
	}
	function Ci(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (c !== null && c === r) break;
			s.tag === 5 && l !== null && (s = l, i ? (c = ut(n, a), c != null && o.unshift(bi(n, c, s))) : i || (c = ut(n, a), c != null && o.push(bi(n, c, s)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var wi = /\r\n?/g, Ti = /\u0000|\uFFFD/g;
	function Ei(e) {
		return (typeof e == "string" ? e : "" + e).replace(wi, "\n").replace(Ti, "");
	}
	function Di(e, t, n) {
		if (t = Ei(t), Ei(e) !== t && n) throw Error(a(425));
	}
	function Oi() {}
	var ki = null, Ai = null;
	function ji(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Mi = typeof setTimeout == "function" ? setTimeout : void 0, Ni = typeof clearTimeout == "function" ? clearTimeout : void 0, Pi = typeof Promise == "function" ? Promise : void 0, Fi = typeof queueMicrotask == "function" ? queueMicrotask : Pi === void 0 ? Mi : function(e) {
		return Pi.resolve(null).then(e).catch(Ii);
	};
	function Ii(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Li(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$") {
					if (r === 0) {
						e.removeChild(i), yn(t);
						return;
					}
					r--;
				} else n !== "$" && n !== "$?" && n !== "$!" || r++;
			}
			n = i;
		} while (n);
		yn(t);
	}
	function Ri(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
				if (t === "/$") return null;
			}
		}
		return e;
	}
	function zi(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?") {
					if (t === 0) return e;
					t--;
				} else n === "/$" && t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	var Bi = Math.random().toString(36).slice(2), Vi = "__reactFiber$" + Bi, Hi = "__reactProps$" + Bi, Ui = "__reactContainer$" + Bi, Wi = "__reactEvents$" + Bi, Gi = "__reactListeners$" + Bi, Ki = "__reactHandles$" + Bi;
	function qi(e) {
		var t = e[Vi];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Ui] || n[Vi]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = zi(e); e !== null;) {
					if (n = e[Vi]) return n;
					e = zi(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Ji(e) {
		return e = e[Vi] || e[Ui], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
	}
	function Yi(e) {
		if (e.tag === 5 || e.tag === 6) return e.stateNode;
		throw Error(a(33));
	}
	function Xi(e) {
		return e[Hi] || null;
	}
	var Zi = [], Qi = -1;
	function $i(e) {
		return { current: e };
	}
	function F(e) {
		0 > Qi || (e.current = Zi[Qi], Zi[Qi] = null, Qi--);
	}
	function I(e, t) {
		Qi++, Zi[Qi] = e.current, e.current = t;
	}
	var ea = {}, L = $i(ea), ta = $i(!1), na = ea;
	function ra(e, t) {
		var n = e.type.contextTypes;
		if (!n) return ea;
		var r = e.stateNode;
		if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
		var i = {}, a;
		for (a in n) i[a] = t[a];
		return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
	}
	function ia(e) {
		return e = e.childContextTypes, e != null;
	}
	function aa() {
		F(ta), F(L);
	}
	function oa(e, t, n) {
		if (L.current !== ea) throw Error(a(168));
		I(L, t), I(ta, n);
	}
	function sa(e, t, n) {
		var r = e.stateNode;
		if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
		for (var i in r = r.getChildContext(), r) if (!(i in t)) throw Error(a(108, Se(e) || "Unknown", i));
		return C({}, n, r);
	}
	function ca(e) {
		return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || ea, na = L.current, I(L, e), I(ta, ta.current), !0;
	}
	function la(e, t, n) {
		var r = e.stateNode;
		if (!r) throw Error(a(169));
		n ? (e = sa(e, t, na), r.__reactInternalMemoizedMergedChildContext = e, F(ta), F(L), I(L, e)) : F(ta), I(ta, n);
	}
	var ua = null, da = !1, fa = !1;
	function pa(e) {
		ua === null ? ua = [e] : ua.push(e);
	}
	function ma(e) {
		da = !0, pa(e);
	}
	function ha() {
		if (!fa && ua !== null) {
			fa = !0;
			var e = 0, t = k;
			try {
				var n = ua;
				for (k = 1; e < n.length; e++) {
					var r = n[e];
					do
						r = r(!0);
					while (r !== null);
				}
				ua = null, da = !1;
			} catch (t) {
				throw ua !== null && (ua = ua.slice(e + 1)), E(At, ha), t;
			} finally {
				k = t, fa = !1;
			}
		}
		return null;
	}
	var ga = [], _a = 0, va = null, ya = 0, ba = [], xa = 0, Sa = null, Ca = 1, wa = "";
	function Ta(e, t) {
		ga[_a++] = ya, ga[_a++] = va, va = e, ya = t;
	}
	function Ea(e, t, n) {
		ba[xa++] = Ca, ba[xa++] = wa, ba[xa++] = Sa, Sa = e;
		var r = Ca;
		e = wa;
		var i = 32 - Lt(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Lt(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Ca = 1 << 32 - Lt(t) + i | n << i | r, wa = a + e;
		} else Ca = 1 << a | n << i | r, wa = e;
	}
	function Da(e) {
		e.return !== null && (Ta(e, 1), Ea(e, 1, 0));
	}
	function Oa(e) {
		for (; e === va;) va = ga[--_a], ga[_a] = null, ya = ga[--_a], ga[_a] = null;
		for (; e === Sa;) Sa = ba[--xa], ba[xa] = null, wa = ba[--xa], ba[xa] = null, Ca = ba[--xa], ba[xa] = null;
	}
	var ka = null, Aa = null, R = !1, ja = null;
	function Ma(e, t) {
		var n = Kl(5, null, null, 0);
		n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
	}
	function Na(e, t) {
		switch (e.tag) {
			case 5:
				var n = e.type;
				return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null && (e.stateNode = t, ka = e, Aa = Ri(t.firstChild), !0);
			case 6: return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null && (e.stateNode = t, ka = e, Aa = null, !0);
			case 13: return t = t.nodeType === 8 ? t : null, t !== null && (n = Sa === null ? null : {
				id: Ca,
				overflow: wa
			}, e.memoizedState = {
				dehydrated: t,
				treeContext: n,
				retryLane: 1073741824
			}, n = Kl(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, ka = e, Aa = null, !0);
			default: return !1;
		}
	}
	function Pa(e) {
		return !!(e.mode & 1) && !(e.flags & 128);
	}
	function Fa(e) {
		if (R) {
			var t = Aa;
			if (t) {
				var n = t;
				if (!Na(e, t)) {
					if (Pa(e)) throw Error(a(418));
					t = Ri(n.nextSibling);
					var r = ka;
					t && Na(e, t) ? Ma(r, n) : (e.flags = e.flags & -4097 | 2, R = !1, ka = e);
				}
			} else {
				if (Pa(e)) throw Error(a(418));
				e.flags = e.flags & -4097 | 2, R = !1, ka = e;
			}
		}
	}
	function Ia(e) {
		for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
		ka = e;
	}
	function La(e) {
		if (e !== ka) return !1;
		if (!R) return Ia(e), R = !0, !1;
		var t;
		if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !ji(e.type, e.memoizedProps)), t &&= Aa) {
			if (Pa(e)) throw Ra(), Error(a(418));
			for (; t;) Ma(e, t), t = Ri(t.nextSibling);
		}
		if (Ia(e), e.tag === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(a(317));
			a: {
				for (e = e.nextSibling, t = 0; e;) {
					if (e.nodeType === 8) {
						var n = e.data;
						if (n === "/$") {
							if (t === 0) {
								Aa = Ri(e.nextSibling);
								break a;
							}
							t--;
						} else n !== "$" && n !== "$!" && n !== "$?" || t++;
					}
					e = e.nextSibling;
				}
				Aa = null;
			}
		} else Aa = ka ? Ri(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Ra() {
		for (var e = Aa; e;) e = Ri(e.nextSibling);
	}
	function za() {
		Aa = ka = null, R = !1;
	}
	function Ba(e) {
		ja === null ? ja = [e] : ja.push(e);
	}
	var Va = x.ReactCurrentBatchConfig;
	function Ha(e, t, n) {
		if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
			if (n._owner) {
				if (n = n._owner, n) {
					if (n.tag !== 1) throw Error(a(309));
					var r = n.stateNode;
				}
				if (!r) throw Error(a(147, e));
				var i = r, o = "" + e;
				return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(e) {
					var t = i.refs;
					e === null ? delete t[o] : t[o] = e;
				}, t._stringRef = o, t);
			}
			if (typeof e != "string") throw Error(a(284));
			if (!n._owner) throw Error(a(290, e));
		}
		return e;
	}
	function Ua(e, t) {
		throw e = Object.prototype.toString.call(t), Error(a(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
	}
	function Wa(e) {
		var t = e._init;
		return t(e._payload);
	}
	function Ga(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e, t) {
			for (e = /* @__PURE__ */ new Map(); t !== null;) t.key === null ? e.set(t.index, t) : e.set(t.key, t), t = t.sibling;
			return e;
		}
		function i(e, t) {
			return e = Yl(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 2, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 2), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = $l(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === ie ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === fe && Wa(a) === t.type) ? (r = i(t, n.props), r.ref = Ha(e, t, n), r.return = e, r) : (r = Xl(n.type, n.key, n.props, null, e.mode, r), r.ref = Ha(e, t, n), r.return = e, r);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = eu(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = Zl(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number") return t = $l("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case ne: return n = Xl(t.type, t.key, t.props, null, e.mode, n), n.ref = Ha(e, null, t), n.return = e, n;
					case re: return t = eu(t, e.mode, n), t.return = e, t;
					case fe:
						var r = t._init;
						return f(e, r(t._payload), n);
				}
				if (Pe(t) || he(t)) return t = Zl(t, e.mode, n, null), t.return = e, t;
				Ua(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ne: return n.key === i ? l(e, t, n, r) : null;
					case re: return n.key === i ? u(e, t, n, r) : null;
					case fe: return i = n._init, p(e, t, i(n._payload), r);
				}
				if (Pe(n) || he(n)) return i === null ? d(e, t, n, r, null) : null;
				Ua(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ne: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case re: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case fe:
						var a = r._init;
						return m(e, t, n, a(r._payload), i);
				}
				if (Pe(r) || he(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				Ua(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), R && Ta(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return R && Ta(i, h), l;
			}
			for (d = r(i, d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), R && Ta(i, h), l;
		}
		function g(i, s, c, l) {
			var u = he(c);
			if (typeof u != "function") throw Error(a(150));
			if (c = u.call(c), c == null) throw Error(a(151));
			for (var d = u = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), R && Ta(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return R && Ta(i, g), u;
			}
			for (h = r(i, h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), R && Ta(i, g), u;
		}
		function _(e, r, a, o) {
			if (typeof a == "object" && a && a.type === ie && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case ne:
						a: {
							for (var c = a.key, l = r; l !== null;) {
								if (l.key === c) {
									if (c = a.type, c === ie) {
										if (l.tag === 7) {
											n(e, l.sibling), r = i(l, a.props.children), r.return = e, e = r;
											break a;
										}
									} else if (l.elementType === c || typeof c == "object" && c && c.$$typeof === fe && Wa(c) === l.type) {
										n(e, l.sibling), r = i(l, a.props), r.ref = Ha(e, l, a), r.return = e, e = r;
										break a;
									}
									n(e, l);
									break;
								}
								t(e, l), l = l.sibling;
							}
							a.type === ie ? (r = Zl(a.props.children, e.mode, o, a.key), r.return = e, e = r) : (o = Xl(a.type, a.key, a.props, null, e.mode, o), o.ref = Ha(e, r, a), o.return = e, e = o);
						}
						return s(e);
					case re:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
										n(e, r.sibling), r = i(r, a.children || []), r.return = e, e = r;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							r = eu(a, e.mode, o), r.return = e, e = r;
						}
						return s(e);
					case fe: return l = a._init, _(e, r, l(a._payload), o);
				}
				if (Pe(a)) return h(e, r, a, o);
				if (he(a)) return g(e, r, a, o);
				Ua(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), r = i(r, a), r.return = e, e = r) : (n(e, r), r = $l(a, e.mode, o), r.return = e, e = r), s(e)) : n(e, r);
		}
		return _;
	}
	var Ka = Ga(!0), qa = Ga(!1), Ja = $i(null), Ya = null, Xa = null, Za = null;
	function Qa() {
		Za = Xa = Ya = null;
	}
	function $a(e) {
		var t = Ja.current;
		F(Ja), e._currentValue = t;
	}
	function eo(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function to(e, t) {
		Ya = e, Za = Xa = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Bs = !0), e.firstContext = null);
	}
	function no(e) {
		var t = e._currentValue;
		if (Za !== e) {
			if (e = {
				context: e,
				memoizedValue: t,
				next: null
			}, Xa === null) {
				if (Ya === null) throw Error(a(308));
				Xa = e, Ya.dependencies = {
					lanes: 0,
					firstContext: e
				};
			} else Xa = Xa.next = e;
		}
		return t;
	}
	var ro = null;
	function io(e) {
		ro === null ? ro = [e] : ro.push(e);
	}
	function ao(e, t, n, r) {
		var i = t.interleaved;
		return i === null ? (n.next = n, io(t)) : (n.next = i.next, i.next = n), t.interleaved = n, oo(e, r);
	}
	function oo(e, t) {
		e.lanes |= t;
		var n = e.alternate;
		for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
		return n.tag === 3 ? n.stateNode : null;
	}
	var so = !1;
	function co(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				interleaved: null,
				lanes: 0
			},
			effects: null
		};
	}
	function lo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			effects: e.effects
		});
	}
	function uo(e, t) {
		return {
			eventTime: e,
			lane: t,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function fo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, J & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, oo(e, n);
		}
		return i = r.interleaved, i === null ? (t.next = t, io(r)) : (t.next = i.next, i.next = t), r.interleaved = t, oo(e, n);
	}
	function po(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194240)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Qt(e, n);
		}
	}
	function mo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						eventTime: n.eventTime,
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: n.callback,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				effects: r.effects
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	function ho(e, t, n, r) {
		var i = e.updateQueue;
		so = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane, p = s.eventTime;
				if ((r & f) === f) {
					u !== null && (u = u.next = {
						eventTime: p,
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: s.callback,
						next: null
					});
					a: {
						var m = e, h = s;
						switch (f = t, p = n, h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(p, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(p, d, f) : m, f == null) break a;
								d = C({}, d, f);
								break a;
							case 2: so = !0;
						}
					}
					s.callback !== null && s.lane !== 0 && (e.flags |= 64, f = i.effects, f === null ? i.effects = [s] : f.push(s));
				} else p = {
					eventTime: p,
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					f = s, s = f.next, f.next = null, i.lastBaseUpdate = f, i.shared.pending = null;
				}
			} while (1);
			if (u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, t = i.shared.interleaved, t !== null) {
				i = t;
				do
					o |= i.lane, i = i.next;
				while (i !== t);
			} else a === null && (i.shared.lanes = 0);
			Yc |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function go(e, t, n) {
		if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
			var r = e[t], i = r.callback;
			if (i !== null) {
				if (r.callback = null, r = n, typeof i != "function") throw Error(a(191, i));
				i.call(r);
			}
		}
	}
	var _o = {}, vo = $i(_o), yo = $i(_o), bo = $i(_o);
	function xo(e) {
		if (e === _o) throw Error(a(174));
		return e;
	}
	function So(e, t) {
		switch (I(bo, t), I(yo, e), I(vo, _o), e = t.nodeType, e) {
			case 9:
			case 11:
				t = (t = t.documentElement) ? t.namespaceURI : Ve(null, "");
				break;
			default: e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ve(t, e);
		}
		F(vo), I(vo, t);
	}
	function Co() {
		F(vo), F(yo), F(bo);
	}
	function wo(e) {
		xo(bo.current);
		var t = xo(vo.current), n = Ve(t, e.type);
		t !== n && (I(yo, e), I(vo, n));
	}
	function To(e) {
		yo.current === e && (F(vo), F(yo));
	}
	var z = $i(0);
	function Eo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Do = [];
	function Oo() {
		for (var e = 0; e < Do.length; e++) Do[e]._workInProgressVersionPrimary = null;
		Do.length = 0;
	}
	var ko = x.ReactCurrentDispatcher, Ao = x.ReactCurrentBatchConfig, jo = 0, B = null, V = null, H = null, Mo = !1, No = !1, Po = 0, Fo = 0;
	function U() {
		throw Error(a(321));
	}
	function Io(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Lr(e[n], t[n])) return !1;
		return !0;
	}
	function Lo(e, t, n, r, i, o) {
		if (jo = o, B = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, ko.current = e === null || e.memoizedState === null ? bs : xs, e = n(r, i), No) {
			o = 0;
			do {
				if (No = !1, Po = 0, 25 <= o) throw Error(a(301));
				o += 1, H = V = null, t.updateQueue = null, ko.current = Ss, e = n(r, i);
			} while (No);
		}
		if (ko.current = ys, t = V !== null && V.next !== null, jo = 0, H = V = B = null, Mo = !1, t) throw Error(a(300));
		return e;
	}
	function Ro() {
		var e = Po !== 0;
		return Po = 0, e;
	}
	function zo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return H === null ? B.memoizedState = H = e : H = H.next = e, H;
	}
	function Bo() {
		if (V === null) {
			var e = B.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = V.next;
		var t = H === null ? B.memoizedState : H.next;
		if (t !== null) H = t, V = e;
		else {
			if (e === null) throw Error(a(310));
			V = e, e = {
				memoizedState: V.memoizedState,
				baseState: V.baseState,
				baseQueue: V.baseQueue,
				queue: V.queue,
				next: null
			}, H === null ? B.memoizedState = H = e : H = H.next = e;
		}
		return H;
	}
	function Vo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Ho(e) {
		var t = Bo(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = V, i = r.baseQueue, o = n.pending;
		if (o !== null) {
			if (i !== null) {
				var s = i.next;
				i.next = o.next, o.next = s;
			}
			r.baseQueue = i = o, n.pending = null;
		}
		if (i !== null) {
			o = i.next, r = r.baseState;
			var c = s = null, l = null, u = o;
			do {
				var d = u.lane;
				if ((jo & d) === d) l !== null && (l = l.next = {
					lane: 0,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}), r = u.hasEagerState ? u.eagerState : e(r, u.action);
				else {
					var f = {
						lane: d,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					};
					l === null ? (c = l = f, s = r) : l = l.next = f, B.lanes |= d, Yc |= d;
				}
				u = u.next;
			} while (u !== null && u !== o);
			l === null ? s = r : l.next = c, Lr(r, t.memoizedState) || (Bs = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = l, n.lastRenderedState = r;
		}
		if (e = n.interleaved, e !== null) {
			i = e;
			do
				o = i.lane, B.lanes |= o, Yc |= o, i = i.next;
			while (i !== e);
		} else i === null && (n.lanes = 0);
		return [t.memoizedState, n.dispatch];
	}
	function Uo(e) {
		var t = Bo(), n = t.queue;
		if (n === null) throw Error(a(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, o = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== i);
			Lr(o, t.memoizedState) || (Bs = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Wo() {}
	function Go(e, t) {
		var n = B, r = Bo(), i = t(), o = !Lr(r.memoizedState, i);
		if (o && (r.memoizedState = i, Bs = !0), r = r.queue, rs(Jo.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || H !== null && H.memoizedState.tag & 1) {
			if (n.flags |= 2048, Qo(9, qo.bind(null, n, r, i, t), void 0, null), Y === null) throw Error(a(349));
			jo & 30 || Ko(n, t, i);
		}
		return i;
	}
	function Ko(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = B.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, B.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function qo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Yo(t) && Xo(e);
	}
	function Jo(e, t, n) {
		return n(function() {
			Yo(t) && Xo(e);
		});
	}
	function Yo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Lr(e, n);
		} catch {
			return !0;
		}
	}
	function Xo(e) {
		var t = oo(e, 1);
		t !== null && hl(t, e, 1, -1);
	}
	function Zo(e) {
		var t = zo();
		return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
			pending: null,
			interleaved: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Vo,
			lastRenderedState: e
		}, t.queue = e, e = e.dispatch = hs.bind(null, B, e), [t.memoizedState, e];
	}
	function Qo(e, t, n, r) {
		return e = {
			tag: e,
			create: t,
			destroy: n,
			deps: r,
			next: null
		}, t = B.updateQueue, t === null ? (t = {
			lastEffect: null,
			stores: null
		}, B.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
	}
	function $o() {
		return Bo().memoizedState;
	}
	function es(e, t, n, r) {
		var i = zo();
		B.flags |= e, i.memoizedState = Qo(1 | t, n, void 0, r === void 0 ? null : r);
	}
	function ts(e, t, n, r) {
		var i = Bo();
		r = r === void 0 ? null : r;
		var a = void 0;
		if (V !== null) {
			var o = V.memoizedState;
			if (a = o.destroy, r !== null && Io(r, o.deps)) {
				i.memoizedState = Qo(t, n, a, r);
				return;
			}
		}
		B.flags |= e, i.memoizedState = Qo(1 | t, n, a, r);
	}
	function ns(e, t) {
		return es(8390656, 8, e, t);
	}
	function rs(e, t) {
		return ts(2048, 8, e, t);
	}
	function is(e, t) {
		return ts(4, 2, e, t);
	}
	function as(e, t) {
		return ts(4, 4, e, t);
	}
	function os(e, t) {
		if (typeof t == "function") return e = e(), t(e), function() {
			t(null);
		};
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function ss(e, t, n) {
		return n = n == null ? null : n.concat([e]), ts(4, 4, os.bind(null, t, e), n);
	}
	function cs() {}
	function ls(e, t) {
		var n = Bo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Io(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function us(e, t) {
		var n = Bo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return r !== null && t !== null && Io(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
	}
	function ds(e, t, n) {
		return jo & 21 ? (Lr(n, t) || (n = Jt(), B.lanes |= n, Yc |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Bs = !0), e.memoizedState = n);
	}
	function fs(e, t) {
		var n = k;
		k = n !== 0 && 4 > n ? n : 4, e(!0);
		var r = Ao.transition;
		Ao.transition = {};
		try {
			e(!1), t();
		} finally {
			k = n, Ao.transition = r;
		}
	}
	function ps() {
		return Bo().memoizedState;
	}
	function ms(e, t, n) {
		var r = ml(e);
		if (n = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, gs(e)) _s(t, n);
		else if (n = ao(e, t, n, r), n !== null) {
			var i = pl();
			hl(n, e, r, i), vs(n, t, r);
		}
	}
	function hs(e, t, n) {
		var r = ml(e), i = {
			lane: r,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (gs(e)) _s(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Lr(s, o)) {
					var c = t.interleaved;
					c === null ? (i.next = i, io(t)) : (i.next = c.next, c.next = i), t.interleaved = i;
					return;
				}
			} catch {}
			n = ao(e, t, i, r), n !== null && (i = pl(), hl(n, e, r, i), vs(n, t, r));
		}
	}
	function gs(e) {
		var t = e.alternate;
		return e === B || t !== null && t === B;
	}
	function _s(e, t) {
		No = Mo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function vs(e, t, n) {
		if (n & 4194240) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Qt(e, n);
		}
	}
	var ys = {
		readContext: no,
		useCallback: U,
		useContext: U,
		useEffect: U,
		useImperativeHandle: U,
		useInsertionEffect: U,
		useLayoutEffect: U,
		useMemo: U,
		useReducer: U,
		useRef: U,
		useState: U,
		useDebugValue: U,
		useDeferredValue: U,
		useTransition: U,
		useMutableSource: U,
		useSyncExternalStore: U,
		useId: U,
		unstable_isNewReconciler: !1
	}, bs = {
		readContext: no,
		useCallback: function(e, t) {
			return zo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: no,
		useEffect: ns,
		useImperativeHandle: function(e, t, n) {
			return n = n == null ? null : n.concat([e]), es(4194308, 4, os.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return es(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			return es(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = zo();
			return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
		},
		useReducer: function(e, t, n) {
			var r = zo();
			return t = n === void 0 ? t : n(t), r.memoizedState = r.baseState = t, e = {
				pending: null,
				interleaved: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: t
			}, r.queue = e, e = e.dispatch = ms.bind(null, B, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = zo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: Zo,
		useDebugValue: cs,
		useDeferredValue: function(e) {
			return zo().memoizedState = e;
		},
		useTransition: function() {
			var e = Zo(!1), t = e[0];
			return e = fs.bind(null, e[1]), zo().memoizedState = e, [t, e];
		},
		useMutableSource: function() {},
		useSyncExternalStore: function(e, t, n) {
			var r = B, i = zo();
			if (R) {
				if (n === void 0) throw Error(a(407));
				n = n();
			} else {
				if (n = t(), Y === null) throw Error(a(349));
				jo & 30 || Ko(r, t, n);
			}
			i.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return i.queue = o, ns(Jo.bind(null, r, o, e), [e]), r.flags |= 2048, Qo(9, qo.bind(null, r, o, n, t), void 0, null), n;
		},
		useId: function() {
			var e = zo(), t = Y.identifierPrefix;
			if (R) {
				var n = wa, r = Ca;
				n = (r & ~(1 << 32 - Lt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Po++, 0 < n && (t += "H" + n.toString(32)), t += ":";
			} else n = Fo++, t = ":" + t + "r" + n.toString(32) + ":";
			return e.memoizedState = t;
		},
		unstable_isNewReconciler: !1
	}, xs = {
		readContext: no,
		useCallback: ls,
		useContext: no,
		useEffect: rs,
		useImperativeHandle: ss,
		useInsertionEffect: is,
		useLayoutEffect: as,
		useMemo: us,
		useReducer: Ho,
		useRef: $o,
		useState: function() {
			return Ho(Vo);
		},
		useDebugValue: cs,
		useDeferredValue: function(e) {
			return ds(Bo(), V.memoizedState, e);
		},
		useTransition: function() {
			return [Ho(Vo)[0], Bo().memoizedState];
		},
		useMutableSource: Wo,
		useSyncExternalStore: Go,
		useId: ps,
		unstable_isNewReconciler: !1
	}, Ss = {
		readContext: no,
		useCallback: ls,
		useContext: no,
		useEffect: rs,
		useImperativeHandle: ss,
		useInsertionEffect: is,
		useLayoutEffect: as,
		useMemo: us,
		useReducer: Uo,
		useRef: $o,
		useState: function() {
			return Uo(Vo);
		},
		useDebugValue: cs,
		useDeferredValue: function(e) {
			var t = Bo();
			return V === null ? t.memoizedState = e : ds(t, V.memoizedState, e);
		},
		useTransition: function() {
			return [Uo(Vo)[0], Bo().memoizedState];
		},
		useMutableSource: Wo,
		useSyncExternalStore: Go,
		useId: ps,
		unstable_isNewReconciler: !1
	};
	function Cs(e, t) {
		if (e && e.defaultProps) {
			for (var n in t = C({}, t), e = e.defaultProps, e) t[n] === void 0 && (t[n] = e[n]);
			return t;
		}
		return t;
	}
	function ws(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : C({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Ts = {
		isMounted: function(e) {
			return (e = e._reactInternals) ? bt(e) === e : !1;
		},
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = uo(r, i);
			a.payload = t, n != null && (a.callback = n), t = fo(e, a, i), t !== null && (hl(t, e, i, r), po(t, e, i));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pl(), i = ml(e), a = uo(r, i);
			a.tag = 1, a.payload = t, n != null && (a.callback = n), t = fo(e, a, i), t !== null && (hl(t, e, i, r), po(t, e, i));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pl(), r = ml(e), i = uo(n, r);
			i.tag = 2, t != null && (i.callback = t), t = fo(e, i, r), t !== null && (hl(t, e, r, n), po(t, e, r));
		}
	};
	function Es(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Rr(n, r) || !Rr(i, a) : !0;
	}
	function Ds(e, t, n) {
		var r = !1, i = ea, a = t.contextType;
		return typeof a == "object" && a ? a = no(a) : (i = ia(t) ? na : L.current, r = t.contextTypes, a = (r = r != null) ? ra(e, i) : ea), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Ts, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = a), t;
	}
	function Os(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ts.enqueueReplaceState(t, t.state, null);
	}
	function ks(e, t, n, r) {
		var i = e.stateNode;
		i.props = n, i.state = e.memoizedState, i.refs = {}, co(e);
		var a = t.contextType;
		typeof a == "object" && a ? i.context = no(a) : (a = ia(t) ? na : L.current, i.context = ra(e, a)), i.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (ws(e, t, a, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && Ts.enqueueReplaceState(i, i.state, null), ho(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
	}
	function As(e, t) {
		try {
			var n = "", r = t;
			do
				n += be(r), r = r.return;
			while (r);
			var i = n;
		} catch (e) {
			i = "\nError generating stack: " + e.message + "\n" + e.stack;
		}
		return {
			value: e,
			source: t,
			stack: i,
			digest: null
		};
	}
	function js(e, t, n) {
		return {
			value: e,
			source: null,
			stack: n ?? null,
			digest: t ?? null
		};
	}
	function Ms(e, t) {
		try {
			console.error(t.value);
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	var Ns = typeof WeakMap == "function" ? WeakMap : Map;
	function Ps(e, t, n) {
		n = uo(-1, n), n.tag = 3, n.payload = { element: null };
		var r = t.value;
		return n.callback = function() {
			rl || (rl = !0, il = r), Ms(e, t);
		}, n;
	}
	function Fs(e, t, n) {
		n = uo(-1, n), n.tag = 3;
		var r = e.type.getDerivedStateFromError;
		if (typeof r == "function") {
			var i = t.value;
			n.payload = function() {
				return r(i);
			}, n.callback = function() {
				Ms(e, t);
			};
		}
		var a = e.stateNode;
		return a !== null && typeof a.componentDidCatch == "function" && (n.callback = function() {
			Ms(e, t), typeof r != "function" && (al === null ? al = /* @__PURE__ */ new Set([this]) : al.add(this));
			var n = t.stack;
			this.componentDidCatch(t.value, { componentStack: n === null ? "" : n });
		}), n;
	}
	function Is(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Ns();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (i.add(n), e = zl.bind(null, e, t, n), t.then(e, e));
	}
	function Ls(e) {
		do {
			var t;
			if ((t = e.tag === 13) && (t = e.memoizedState, t = t === null || t.dehydrated !== null), t) return e;
			e = e.return;
		} while (e !== null);
		return null;
	}
	function Rs(e, t, n, r, i) {
		return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = uo(-1, 1), t.tag = 2, fo(n, t, 1))), n.lanes |= 1), e);
	}
	var zs = x.ReactCurrentOwner, Bs = !1;
	function Vs(e, t, n, r) {
		t.child = e === null ? qa(t, null, n, r) : Ka(t, e.child, n, r);
	}
	function Hs(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		return to(t, i), r = Lo(e, t, n, r, a, i), n = Ro(), e !== null && !Bs ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, cc(e, t, i)) : (R && n && Da(t), t.flags |= 1, Vs(e, t, r, i), t.child);
	}
	function Us(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ql(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Ws(e, t, a, r, i)) : (e = Xl(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, (e.lanes & i) === 0) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Rr : n, n(o, r) && e.ref === t.ref) return cc(e, t, i);
		}
		return t.flags |= 1, e = Yl(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Ws(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Rr(a, r) && e.ref === t.ref) {
				if (Bs = !1, t.pendingProps = r = a, (e.lanes & i) !== 0) e.flags & 131072 && (Bs = !0);
				else return t.lanes = e.lanes, cc(e, t, i);
			}
		}
		return qs(e, t, n, r, i);
	}
	function Gs(e, t, n) {
		var r = t.pendingProps, i = r.children, a = e === null ? null : e.memoizedState;
		if (r.mode === "hidden") {
			if (!(t.mode & 1)) t.memoizedState = {
				baseLanes: 0,
				cachePool: null,
				transitions: null
			}, I(qc, Kc), Kc |= n;
			else {
				if (!(n & 1073741824)) return e = a === null ? n : a.baseLanes | n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
					baseLanes: e,
					cachePool: null,
					transitions: null
				}, t.updateQueue = null, I(qc, Kc), Kc |= e, null;
				t.memoizedState = {
					baseLanes: 0,
					cachePool: null,
					transitions: null
				}, r = a === null ? n : a.baseLanes, I(qc, Kc), Kc |= r;
			}
		} else a === null ? r = n : (r = a.baseLanes | n, t.memoizedState = null), I(qc, Kc), Kc |= r;
		return Vs(e, t, i, n), t.child;
	}
	function Ks(e, t) {
		var n = t.ref;
		(e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
	}
	function qs(e, t, n, r, i) {
		var a = ia(n) ? na : L.current;
		return a = ra(t, a), to(t, i), n = Lo(e, t, n, r, a, i), r = Ro(), e !== null && !Bs ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, cc(e, t, i)) : (R && r && Da(t), t.flags |= 1, Vs(e, t, n, i), t.child);
	}
	function Js(e, t, n, r, i) {
		if (ia(n)) {
			var a = !0;
			ca(t);
		} else a = !1;
		if (to(t, i), t.stateNode === null) sc(e, t), Ds(t, n, r), ks(t, n, r, i), r = !0;
		else if (e === null) {
			var o = t.stateNode, s = t.memoizedProps;
			o.props = s;
			var c = o.context, l = n.contextType;
			typeof l == "object" && l ? l = no(l) : (l = ia(n) ? na : L.current, l = ra(t, l));
			var u = n.getDerivedStateFromProps, d = typeof u == "function" || typeof o.getSnapshotBeforeUpdate == "function";
			d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== r || c !== l) && Os(t, o, r, l), so = !1;
			var f = t.memoizedState;
			o.state = f, ho(t, r, o, i), c = t.memoizedState, s !== r || f !== c || ta.current || so ? (typeof u == "function" && (ws(t, n, u, r), c = t.memoizedState), (s = so || Es(t, n, s, r, f, c, l)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = c), o.props = r, o.state = c, o.context = l, r = s) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			o = t.stateNode, lo(e, t), s = t.memoizedProps, l = t.type === t.elementType ? s : Cs(t.type, s), o.props = l, d = t.pendingProps, f = o.context, c = n.contextType, typeof c == "object" && c ? c = no(c) : (c = ia(n) ? na : L.current, c = ra(t, c));
			var p = n.getDerivedStateFromProps;
			(u = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s !== d || f !== c) && Os(t, o, r, c), so = !1, f = t.memoizedState, o.state = f, ho(t, r, o, i);
			var m = t.memoizedState;
			s !== d || f !== m || ta.current || so ? (typeof p == "function" && (ws(t, n, p, r), m = t.memoizedState), (l = so || Es(t, n, l, r, f, m, c) || !1) ? (u || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, m, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, m, c)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = m), o.props = r, o.state = m, o.context = c, r = l) : (typeof o.componentDidUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return Ys(e, t, n, r, a, i);
	}
	function Ys(e, t, n, r, i, a) {
		Ks(e, t);
		var o = !!(t.flags & 128);
		if (!r && !o) return i && la(t, n, !1), cc(e, t, a);
		r = t.stateNode, zs.current = t;
		var s = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
		return t.flags |= 1, e !== null && o ? (t.child = Ka(t, e.child, null, a), t.child = Ka(t, null, s, a)) : Vs(e, t, s, a), t.memoizedState = r.state, i && la(t, n, !0), t.child;
	}
	function Xs(e) {
		var t = e.stateNode;
		t.pendingContext ? oa(e, t.pendingContext, t.pendingContext !== t.context) : t.context && oa(e, t.context, !1), So(e, t.containerInfo);
	}
	function Zs(e, t, n, r, i) {
		return za(), Ba(i), t.flags |= 256, Vs(e, t, n, r), t.child;
	}
	var Qs = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0
	};
	function $s(e) {
		return {
			baseLanes: e,
			cachePool: null,
			transitions: null
		};
	}
	function ec(e, t, n) {
		var r = t.pendingProps, i = z.current, a = !1, o = !!(t.flags & 128), s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : !!(i & 2)), s ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), I(z, i & 1), e === null) return Fa(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.lanes = t.mode & 1 ? e.data === "$!" ? 8 : 1073741824 : 1, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = {
			mode: "hidden",
			children: o
		}, !(r & 1) && a !== null ? (a.childLanes = 0, a.pendingProps = o) : a = Ql(o, r, 0, null), e = Zl(e, r, n, null), a.return = t, e.return = t, a.sibling = e, t.child = a, t.child.memoizedState = $s(n), t.memoizedState = Qs, e) : tc(t, o));
		if (i = e.memoizedState, i !== null && (s = i.dehydrated, s !== null)) return rc(e, t, o, r, s, i, n);
		if (a) {
			a = r.fallback, o = t.mode, i = e.child, s = i.sibling;
			var c = {
				mode: "hidden",
				children: r.children
			};
			return !(o & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = c, t.deletions = null) : (r = Yl(i, c), r.subtreeFlags = i.subtreeFlags & 14680064), s === null ? (a = Zl(a, o, n, null), a.flags |= 2) : a = Yl(s, a), a.return = t, r.return = t, r.sibling = a, t.child = r, r = a, a = t.child, o = e.child.memoizedState, o = o === null ? $s(n) : {
				baseLanes: o.baseLanes | n,
				cachePool: null,
				transitions: o.transitions
			}, a.memoizedState = o, a.childLanes = e.childLanes & ~n, t.memoizedState = Qs, r;
		}
		return a = e.child, e = a.sibling, r = Yl(a, {
			mode: "visible",
			children: r.children
		}), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
	}
	function tc(e, t) {
		return t = Ql({
			mode: "visible",
			children: t
		}, e.mode, 0, null), t.return = e, e.child = t;
	}
	function nc(e, t, n, r) {
		return r !== null && Ba(r), Ka(t, e.child, null, n), e = tc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function rc(e, t, n, r, i, o, s) {
		if (n) return t.flags & 256 ? (t.flags &= -257, r = js(Error(a(422))), nc(e, t, s, r)) : t.memoizedState === null ? (o = r.fallback, i = t.mode, r = Ql({
			mode: "visible",
			children: r.children
		}, i, 0, null), o = Zl(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && Ka(t, e.child, null, s), t.child.memoizedState = $s(s), t.memoizedState = Qs, o) : (t.child = e.child, t.flags |= 128, null);
		if (!(t.mode & 1)) return nc(e, t, s, null);
		if (i.data === "$!") {
			if (r = i.nextSibling && i.nextSibling.dataset, r) var c = r.dgst;
			return r = c, o = Error(a(419)), r = js(o, r, void 0), nc(e, t, s, r);
		}
		if (c = (s & e.childLanes) !== 0, Bs || c) {
			if (r = Y, r !== null) {
				switch (s & -s) {
					case 4:
						i = 2;
						break;
					case 16:
						i = 8;
						break;
					case 64:
					case 128:
					case 256:
					case 512:
					case 1024:
					case 2048:
					case 4096:
					case 8192:
					case 16384:
					case 32768:
					case 65536:
					case 131072:
					case 262144:
					case 524288:
					case 1048576:
					case 2097152:
					case 4194304:
					case 8388608:
					case 16777216:
					case 33554432:
					case 67108864:
						i = 32;
						break;
					case 536870912:
						i = 268435456;
						break;
					default: i = 0;
				}
				i = (i & (r.suspendedLanes | s)) === 0 ? i : 0, i !== 0 && i !== o.retryLane && (o.retryLane = i, oo(e, i), hl(r, e, i, -1));
			}
			return kl(), r = js(Error(a(421))), nc(e, t, s, r);
		}
		return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vl.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, Aa = Ri(i.nextSibling), ka = t, R = !0, ja = null, e !== null && (ba[xa++] = Ca, ba[xa++] = wa, ba[xa++] = Sa, Ca = e.id, wa = e.overflow, Sa = t), t = tc(t, r.children), t.flags |= 4096, t);
	}
	function ic(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), eo(e.return, t, n);
	}
	function ac(e, t, n, r, i) {
		var a = e.memoizedState;
		a === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i
		} : (a.isBackwards = t, a.rendering = null, a.renderingStartTime = 0, a.last = r, a.tail = n, a.tailMode = i);
	}
	function oc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		if (Vs(e, t, r.children, n), r = z.current, r & 2) r = r & 1 | 2, t.flags |= 128;
		else {
			if (e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
				if (e.tag === 13) e.memoizedState !== null && ic(e, n, t);
				else if (e.tag === 19) ic(e, n, t);
				else if (e.child !== null) {
					e.child.return = e, e = e.child;
					continue;
				}
				if (e === t) break a;
				for (; e.sibling === null;) {
					if (e.return === null || e.return === t) break a;
					e = e.return;
				}
				e.sibling.return = e.return, e = e.sibling;
			}
			r &= 1;
		}
		if (I(z, r), !(t.mode & 1)) t.memoizedState = null;
		else switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && Eo(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), ac(t, !1, i, n, a);
				break;
			case "backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Eo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				ac(t, !0, n, null, a);
				break;
			case "together":
				ac(t, !1, null, null, void 0);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function sc(e, t) {
		!(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
	}
	function cc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Yc |= t.lanes, (n & t.childLanes) === 0) return null;
		if (e !== null && t.child !== e.child) throw Error(a(153));
		if (t.child !== null) {
			for (e = t.child, n = Yl(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Yl(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function lc(e, t, n) {
		switch (t.tag) {
			case 3:
				Xs(t), za();
				break;
			case 5:
				wo(t);
				break;
			case 1:
				ia(t.type) && ca(t);
				break;
			case 4:
				So(t, t.stateNode.containerInfo);
				break;
			case 10:
				var r = t.type._context, i = t.memoizedProps.value;
				I(Ja, r._currentValue), r._currentValue = i;
				break;
			case 13:
				if (r = t.memoizedState, r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (I(z, z.current & 1), e = cc(e, t, n), e === null ? null : e.sibling) : ec(e, t, n) : (I(z, z.current & 1), t.flags |= 128, null);
				I(z, z.current & 1);
				break;
			case 19:
				if (r = (n & t.childLanes) !== 0, e.flags & 128) {
					if (r) return oc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), I(z, z.current), r) break;
				return null;
			case 22:
			case 23: return t.lanes = 0, Gs(e, t, n);
		}
		return cc(e, t, n);
	}
	var uc = function(e, t) {
		for (var n = t.child; n !== null;) {
			if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
			else if (n.tag !== 4 && n.child !== null) {
				n.child.return = n, n = n.child;
				continue;
			}
			if (n === t) break;
			for (; n.sibling === null;) {
				if (n.return === null || n.return === t) return;
				n = n.return;
			}
			n.sibling.return = n.return, n = n.sibling;
		}
	}, dc = function(e, t, n, r) {
		var i = e.memoizedProps;
		if (i !== r) {
			e = t.stateNode, xo(vo.current);
			var a = null;
			switch (n) {
				case "input":
					i = Oe(e, i), r = Oe(e, r), a = [];
					break;
				case "select":
					i = C({}, i, { value: void 0 }), r = C({}, r, { value: void 0 }), a = [];
					break;
				case "textarea":
					i = Ie(e, i), r = Ie(e, r), a = [];
					break;
				default: typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Oi);
			}
			Xe(n, r);
			var o;
			for (u in n = null, i) if (!r.hasOwnProperty(u) && i.hasOwnProperty(u) && i[u] != null) {
				if (u === "style") {
					var c = i[u];
					for (o in c) c.hasOwnProperty(o) && (n ||= {}, n[o] = "");
				} else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (s.hasOwnProperty(u) ? a ||= [] : (a ||= []).push(u, null));
			}
			for (u in r) {
				var l = r[u];
				if (c = i?.[u], r.hasOwnProperty(u) && l !== c && (l != null || c != null)) {
					if (u === "style") {
						if (c) {
							for (o in c) !c.hasOwnProperty(o) || l && l.hasOwnProperty(o) || (n ||= {}, n[o] = "");
							for (o in l) l.hasOwnProperty(o) && c[o] !== l[o] && (n ||= {}, n[o] = l[o]);
						} else n || (a ||= [], a.push(u, n)), n = l;
					} else u === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, c = c ? c.__html : void 0, l != null && c !== l && (a ||= []).push(u, l)) : u === "children" ? typeof l != "string" && typeof l != "number" || (a ||= []).push(u, "" + l) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (s.hasOwnProperty(u) ? (l != null && u === "onScroll" && P("scroll", e), a || c === l || (a = [])) : (a ||= []).push(u, l));
				}
			}
			n && (a ||= []).push("style", n);
			var u = a;
			(t.updateQueue = u) && (t.flags |= 4);
		}
	}, fc = function(e, t, n, r) {
		n !== r && (t.flags |= 4);
	};
	function pc(e, t) {
		if (!R) switch (e.tailMode) {
			case "hidden":
				t = e.tail;
				for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
				break;
			case "collapsed":
				n = e.tail;
				for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
		}
	}
	function W(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function mc(e, t, n) {
		var r = t.pendingProps;
		switch (Oa(t), t.tag) {
			case 2:
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return W(t), null;
			case 1: return ia(t.type) && aa(), W(t), null;
			case 3: return r = t.stateNode, Co(), F(ta), F(L), Oo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (La(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ja !== null && (yl(ja), ja = null))), W(t), null;
			case 5:
				To(t);
				var i = xo(bo.current);
				if (n = t.type, e !== null && t.stateNode != null) dc(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(a(166));
						return W(t), null;
					}
					if (e = xo(vo.current), La(t)) {
						r = t.stateNode, n = t.type;
						var o = t.memoizedProps;
						switch (r[Vi] = t, r[Hi] = o, e = !!(t.mode & 1), n) {
							case "dialog":
								P("cancel", r), P("close", r);
								break;
							case "iframe":
							case "object":
							case "embed":
								P("load", r);
								break;
							case "video":
							case "audio":
								for (i = 0; i < di.length; i++) P(di[i], r);
								break;
							case "source":
								P("error", r);
								break;
							case "img":
							case "image":
							case "link":
								P("error", r), P("load", r);
								break;
							case "details":
								P("toggle", r);
								break;
							case "input":
								ke(r, o), P("invalid", r);
								break;
							case "select":
								r._wrapperState = { wasMultiple: !!o.multiple }, P("invalid", r);
								break;
							case "textarea": Le(r, o), P("invalid", r);
						}
						for (var c in Xe(n, o), i = null, o) if (o.hasOwnProperty(c)) {
							var l = o[c];
							c === "children" ? typeof l == "string" ? r.textContent !== l && (!0 !== o.suppressHydrationWarning && Di(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (!0 !== o.suppressHydrationWarning && Di(r.textContent, l, e), i = ["children", "" + l]) : s.hasOwnProperty(c) && l != null && c === "onScroll" && P("scroll", r);
						}
						switch (n) {
							case "input":
								Ee(r), Me(r, o, !0);
								break;
							case "textarea":
								Ee(r), ze(r);
								break;
							case "select":
							case "option": break;
							default: typeof o.onClick == "function" && (r.onclick = Oi);
						}
						r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
					} else {
						c = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Be(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = c.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = c.createElement(n, { is: r.is }) : (e = c.createElement(n), n === "select" && (c = e, r.multiple ? c.multiple = !0 : r.size && (c.size = r.size))) : e = c.createElementNS(e, n), e[Vi] = t, e[Hi] = r, uc(e, t, !1, !1), t.stateNode = e;
						a: {
							switch (c = Ze(n, r), n) {
								case "dialog":
									P("cancel", e), P("close", e), i = r;
									break;
								case "iframe":
								case "object":
								case "embed":
									P("load", e), i = r;
									break;
								case "video":
								case "audio":
									for (i = 0; i < di.length; i++) P(di[i], e);
									i = r;
									break;
								case "source":
									P("error", e), i = r;
									break;
								case "img":
								case "image":
								case "link":
									P("error", e), P("load", e), i = r;
									break;
								case "details":
									P("toggle", e), i = r;
									break;
								case "input":
									ke(e, r), i = Oe(e, r), P("invalid", e);
									break;
								case "option":
									i = r;
									break;
								case "select":
									e._wrapperState = { wasMultiple: !!r.multiple }, i = C({}, r, { value: void 0 }), P("invalid", e);
									break;
								case "textarea":
									Le(e, r), i = Ie(e, r), P("invalid", e);
									break;
								default: i = r;
							}
							for (o in Xe(n, i), l = i, l) if (l.hasOwnProperty(o)) {
								var u = l[o];
								o === "style" ? Je(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Ue(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && We(e, u) : typeof u == "number" && We(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (s.hasOwnProperty(o) ? u != null && o === "onScroll" && P("scroll", e) : u != null && te(e, o, u, c));
							}
							switch (n) {
								case "input":
									Ee(e), Me(e, r, !1);
									break;
								case "textarea":
									Ee(e), ze(e);
									break;
								case "option":
									r.value != null && e.setAttribute("value", "" + Ce(r.value));
									break;
								case "select":
									e.multiple = !!r.multiple, o = r.value, o == null ? r.defaultValue != null && Fe(e, !!r.multiple, r.defaultValue, !0) : Fe(e, !!r.multiple, o, !1);
									break;
								default: typeof i.onClick == "function" && (e.onclick = Oi);
							}
							switch (n) {
								case "button":
								case "input":
								case "select":
								case "textarea":
									r = !!r.autoFocus;
									break a;
								case "img":
									r = !0;
									break a;
								default: r = !1;
							}
						}
						r && (t.flags |= 4);
					}
					t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
				}
				return W(t), null;
			case 6:
				if (e && t.stateNode != null) fc(e, t, e.memoizedProps, r);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(a(166));
					if (n = xo(bo.current), xo(vo.current), La(t)) {
						if (r = t.stateNode, n = t.memoizedProps, r[Vi] = t, (o = r.nodeValue !== n) && (e = ka, e !== null)) switch (e.tag) {
							case 3:
								Di(r.nodeValue, n, !!(e.mode & 1));
								break;
							case 5: !0 !== e.memoizedProps.suppressHydrationWarning && Di(r.nodeValue, n, !!(e.mode & 1));
						}
						o && (t.flags |= 4);
					} else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Vi] = t, t.stateNode = r;
				}
				return W(t), null;
			case 13:
				if (F(z), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (R && Aa !== null && t.mode & 1 && !(t.flags & 128)) Ra(), za(), t.flags |= 98560, o = !1;
					else if (o = La(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!o) throw Error(a(318));
							if (o = t.memoizedState, o = o === null ? null : o.dehydrated, !o) throw Error(a(317));
							o[Vi] = t;
						} else za(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						W(t), o = !1;
					} else ja !== null && (yl(ja), ja = null), o = !0;
					if (!o) return t.flags & 65536 ? t : null;
				}
				return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || z.current & 1 ? Q === 0 && (Q = 3) : kl())), t.updateQueue !== null && (t.flags |= 4), W(t), null);
			case 4: return Co(), e === null && _i(t.stateNode.containerInfo), W(t), null;
			case 10: return $a(t.type._context), W(t), null;
			case 17: return ia(t.type) && aa(), W(t), null;
			case 19:
				if (F(z), o = t.memoizedState, o === null) return W(t), null;
				if (r = !!(t.flags & 128), c = o.rendering, c === null) {
					if (r) pc(o, !1);
					else {
						if (Q !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (c = Eo(e), c !== null) {
								for (t.flags |= 128, pc(o, !1), r = c.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, c = o.alternate, c === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = c.childLanes, o.lanes = c.lanes, o.child = c.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = c.memoizedProps, o.memoizedState = c.memoizedState, o.updateQueue = c.updateQueue, o.type = c.type, e = c.dependencies, o.dependencies = e === null ? null : {
									lanes: e.lanes,
									firstContext: e.firstContext
								}), n = n.sibling;
								return I(z, z.current & 1 | 2), t.child;
							}
							e = e.sibling;
						}
						o.tail !== null && D() > tl && (t.flags |= 128, r = !0, pc(o, !1), t.lanes = 4194304);
					}
				} else {
					if (!r) {
						if (e = Eo(c), e !== null) {
							if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), pc(o, !0), o.tail === null && o.tailMode === "hidden" && !c.alternate && !R) return W(t), null;
						} else 2 * D() - o.renderingStartTime > tl && n !== 1073741824 && (t.flags |= 128, r = !0, pc(o, !1), t.lanes = 4194304);
					}
					o.isBackwards ? (c.sibling = t.child, t.child = c) : (n = o.last, n === null ? t.child = c : n.sibling = c, o.last = c);
				}
				return o.tail === null ? (W(t), null) : (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = D(), t.sibling = null, n = z.current, I(z, r ? n & 1 | 2 : n & 1), t);
			case 22:
			case 23: return Tl(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Kc & 1073741824 && (W(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : W(t), null;
			case 24: return null;
			case 25: return null;
		}
		throw Error(a(156, t.tag));
	}
	function hc(e, t) {
		switch (Oa(t), t.tag) {
			case 1: return ia(t.type) && aa(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Co(), F(ta), F(L), Oo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 5: return To(t), null;
			case 13:
				if (F(z), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(a(340));
					za();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return F(z), null;
			case 4: return Co(), null;
			case 10: return $a(t.type._context), null;
			case 22:
			case 23: return Tl(), null;
			case 24: return null;
			default: return null;
		}
	}
	var gc = !1, G = !1, _c = typeof WeakSet == "function" ? WeakSet : Set, K = null;
	function vc(e, t) {
		var n = e.ref;
		if (n !== null) {
			if (typeof n == "function") try {
				n(null);
			} catch (n) {
				$(e, t, n);
			}
			else n.current = null;
		}
	}
	function yc(e, t, n) {
		try {
			n();
		} catch (n) {
			$(e, t, n);
		}
	}
	var bc = !1;
	function xc(e, t) {
		if (ki = xn, e = Hr(), Ur(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var i = r.anchorOffset, o = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, o.nodeType;
					} catch {
						n = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || i !== 0 && f.nodeType !== 3 || (c = s + i), f !== o || r !== 0 && f.nodeType !== 3 || (l = s + r), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === i && (c = s), p === o && ++d === r && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					n = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else n = null;
			}
			n ||= {
				start: 0,
				end: 0
			};
		} else n = null;
		for (Ai = {
			focusedElem: e,
			selectionRange: n
		}, xn = !1, K = t; K !== null;) if (t = K, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, K = e;
		else for (; K !== null;) {
			t = K;
			try {
				var h = t.alternate;
				if (t.flags & 1024) switch (t.tag) {
					case 0:
					case 11:
					case 15: break;
					case 1:
						if (h !== null) {
							var g = h.memoizedProps, _ = h.memoizedState, v = t.stateNode;
							v.__reactInternalSnapshotBeforeUpdate = v.getSnapshotBeforeUpdate(t.elementType === t.type ? g : Cs(t.type, g), _);
						}
						break;
					case 3:
						var y = t.stateNode.containerInfo;
						y.nodeType === 1 ? y.textContent = "" : y.nodeType === 9 && y.documentElement && y.removeChild(y.documentElement);
						break;
					case 5:
					case 6:
					case 4:
					case 17: break;
					default: throw Error(a(163));
				}
			} catch (e) {
				$(t, t.return, e);
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, K = e;
				break;
			}
			K = t.return;
		}
		return h = bc, bc = !1, h;
	}
	function Sc(e, t, n) {
		var r = t.updateQueue;
		if (r = r === null ? null : r.lastEffect, r !== null) {
			var i = r = r.next;
			do {
				if ((i.tag & e) === e) {
					var a = i.destroy;
					i.destroy = void 0, a !== void 0 && yc(t, n, a);
				}
				i = i.next;
			} while (i !== r);
		}
	}
	function Cc(e, t) {
		if (t = t.updateQueue, t = t === null ? null : t.lastEffect, t !== null) {
			var n = t = t.next;
			do {
				if ((n.tag & e) === e) {
					var r = n.create;
					n.destroy = r();
				}
				n = n.next;
			} while (n !== t);
		}
	}
	function wc(e) {
		var t = e.ref;
		if (t !== null) {
			var n = e.stateNode;
			switch (e.tag) {
				case 5:
					e = n;
					break;
				default: e = n;
			}
			typeof t == "function" ? t(e) : t.current = e;
		}
	}
	function Tc(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, Tc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Vi], delete t[Hi], delete t[Wi], delete t[Gi], delete t[Ki])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	function Ec(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 4;
	}
	function Dc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Ec(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Oc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Oi));
		else if (r !== 4 && (e = e.child, e !== null)) for (Oc(e, t, n), e = e.sibling; e !== null;) Oc(e, t, n), e = e.sibling;
	}
	function kc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (e = e.child, e !== null)) for (kc(e, t, n), e = e.sibling; e !== null;) kc(e, t, n), e = e.sibling;
	}
	var q = null, Ac = !1;
	function jc(e, t, n) {
		for (n = n.child; n !== null;) Mc(e, t, n), n = n.sibling;
	}
	function Mc(e, t, n) {
		if (Ft && typeof Ft.onCommitFiberUnmount == "function") try {
			Ft.onCommitFiberUnmount(Pt, n);
		} catch {}
		switch (n.tag) {
			case 5: G || vc(n, t);
			case 6:
				var r = q, i = Ac;
				q = null, jc(e, t, n), q = r, Ac = i, q !== null && (Ac ? (e = q, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : q.removeChild(n.stateNode));
				break;
			case 18:
				q !== null && (Ac ? (e = q, n = n.stateNode, e.nodeType === 8 ? Li(e.parentNode, n) : e.nodeType === 1 && Li(e, n), yn(e)) : Li(q, n.stateNode));
				break;
			case 4:
				r = q, i = Ac, q = n.stateNode.containerInfo, Ac = !0, jc(e, t, n), q = r, Ac = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				if (!G && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
					i = r = r.next;
					do {
						var a = i, o = a.destroy;
						a = a.tag, o !== void 0 && (a & 2 || a & 4) && yc(n, t, o), i = i.next;
					} while (i !== r);
				}
				jc(e, t, n);
				break;
			case 1:
				if (!G && (vc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
					r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
				} catch (e) {
					$(n, t, e);
				}
				jc(e, t, n);
				break;
			case 21:
				jc(e, t, n);
				break;
			case 22:
				n.mode & 1 ? (G = (r = G) || n.memoizedState !== null, jc(e, t, n), G = r) : jc(e, t, n);
				break;
			default: jc(e, t, n);
		}
	}
	function Nc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			e.updateQueue = null;
			var n = e.stateNode;
			n === null && (n = e.stateNode = new _c()), t.forEach(function(t) {
				var r = Hl.bind(null, e, t);
				n.has(t) || (n.add(t), t.then(r, r));
			});
		}
	}
	function Pc(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			try {
				var o = e, s = t, c = s;
				a: for (; c !== null;) {
					switch (c.tag) {
						case 5:
							q = c.stateNode, Ac = !1;
							break a;
						case 3:
							q = c.stateNode.containerInfo, Ac = !0;
							break a;
						case 4:
							q = c.stateNode.containerInfo, Ac = !0;
							break a;
					}
					c = c.return;
				}
				if (q === null) throw Error(a(160));
				Mc(o, s, i), q = null, Ac = !1;
				var l = i.alternate;
				l !== null && (l.return = null), i.return = null;
			} catch (e) {
				$(i, t, e);
			}
		}
		if (t.subtreeFlags & 12854) for (t = t.child; t !== null;) Fc(t, e), t = t.sibling;
	}
	function Fc(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (Pc(t, e), Ic(e), r & 4) {
					try {
						Sc(3, e, e.return), Cc(3, e);
					} catch (t) {
						$(e, e.return, t);
					}
					try {
						Sc(5, e, e.return);
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 1:
				Pc(t, e), Ic(e), r & 512 && n !== null && vc(n, n.return);
				break;
			case 5:
				if (Pc(t, e), Ic(e), r & 512 && n !== null && vc(n, n.return), e.flags & 32) {
					var i = e.stateNode;
					try {
						We(i, "");
					} catch (t) {
						$(e, e.return, t);
					}
				}
				if (r & 4 && (i = e.stateNode, i != null)) {
					var o = e.memoizedProps, s = n === null ? o : n.memoizedProps, c = e.type, l = e.updateQueue;
					if (e.updateQueue = null, l !== null) try {
						c === "input" && o.type === "radio" && o.name != null && Ae(i, o), Ze(c, s);
						var u = Ze(c, o);
						for (s = 0; s < l.length; s += 2) {
							var d = l[s], f = l[s + 1];
							d === "style" ? Je(i, f) : d === "dangerouslySetInnerHTML" ? Ue(i, f) : d === "children" ? We(i, f) : te(i, d, f, u);
						}
						switch (c) {
							case "input":
								je(i, o);
								break;
							case "textarea":
								Re(i, o);
								break;
							case "select":
								var p = i._wrapperState.wasMultiple;
								i._wrapperState.wasMultiple = !!o.multiple;
								var m = o.value;
								m == null ? p !== !!o.multiple && (o.defaultValue == null ? Fe(i, !!o.multiple, o.multiple ? [] : "", !1) : Fe(i, !!o.multiple, o.defaultValue, !0)) : Fe(i, !!o.multiple, m, !1);
						}
						i[Hi] = o;
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 6:
				if (Pc(t, e), Ic(e), r & 4) {
					if (e.stateNode === null) throw Error(a(162));
					i = e.stateNode, o = e.memoizedProps;
					try {
						i.nodeValue = o;
					} catch (t) {
						$(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Pc(t, e), Ic(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					yn(t.containerInfo);
				} catch (t) {
					$(e, e.return, t);
				}
				break;
			case 4:
				Pc(t, e), Ic(e);
				break;
			case 13:
				Pc(t, e), Ic(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || (el = D())), r & 4 && Nc(e);
				break;
			case 22:
				if (d = n !== null && n.memoizedState !== null, e.mode & 1 ? (G = (u = G) || d, Pc(t, e), G = u) : Pc(t, e), Ic(e), r & 8192) {
					if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !d && e.mode & 1) for (K = e, d = e.child; d !== null;) {
						for (f = K = d; K !== null;) {
							switch (p = K, m = p.child, p.tag) {
								case 0:
								case 11:
								case 14:
								case 15:
									Sc(4, p, p.return);
									break;
								case 1:
									vc(p, p.return);
									var h = p.stateNode;
									if (typeof h.componentWillUnmount == "function") {
										r = p, n = p.return;
										try {
											t = r, h.props = t.memoizedProps, h.state = t.memoizedState, h.componentWillUnmount();
										} catch (e) {
											$(r, n, e);
										}
									}
									break;
								case 5:
									vc(p, p.return);
									break;
								case 22: if (p.memoizedState !== null) {
									Bc(f);
									continue;
								}
							}
							m === null ? Bc(f) : (m.return = p, K = m);
						}
						d = d.sibling;
					}
					a: for (d = null, f = e;;) {
						if (f.tag === 5) {
							if (d === null) {
								d = f;
								try {
									i = f.stateNode, u ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (c = f.stateNode, l = f.memoizedProps.style, s = l != null && l.hasOwnProperty("display") ? l.display : null, c.style.display = qe("display", s));
								} catch (t) {
									$(e, e.return, t);
								}
							}
						} else if (f.tag === 6) {
							if (d === null) try {
								f.stateNode.nodeValue = u ? "" : f.memoizedProps;
							} catch (t) {
								$(e, e.return, t);
							}
						} else if ((f.tag !== 22 && f.tag !== 23 || f.memoizedState === null || f === e) && f.child !== null) {
							f.child.return = f, f = f.child;
							continue;
						}
						if (f === e) break a;
						for (; f.sibling === null;) {
							if (f.return === null || f.return === e) break a;
							d === f && (d = null), f = f.return;
						}
						d === f && (d = null), f.sibling.return = f.return, f = f.sibling;
					}
				}
				break;
			case 19:
				Pc(t, e), Ic(e), r & 4 && Nc(e);
				break;
			case 21: break;
			default: Pc(t, e), Ic(e);
		}
	}
	function Ic(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				a: {
					for (var n = e.return; n !== null;) {
						if (Ec(n)) {
							var r = n;
							break a;
						}
						n = n.return;
					}
					throw Error(a(160));
				}
				switch (r.tag) {
					case 5:
						var i = r.stateNode;
						r.flags & 32 && (We(i, ""), r.flags &= -33), kc(e, Dc(e), i);
						break;
					case 3:
					case 4:
						var o = r.stateNode.containerInfo;
						Oc(e, Dc(e), o);
						break;
					default: throw Error(a(161));
				}
			} catch (t) {
				$(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Lc(e, t, n) {
		K = e, Rc(e, t, n);
	}
	function Rc(e, t, n) {
		for (var r = !!(e.mode & 1); K !== null;) {
			var i = K, a = i.child;
			if (i.tag === 22 && r) {
				var o = i.memoizedState !== null || gc;
				if (!o) {
					var s = i.alternate, c = s !== null && s.memoizedState !== null || G;
					s = gc;
					var l = G;
					if (gc = o, (G = c) && !l) for (K = i; K !== null;) o = K, c = o.child, o.tag === 22 && o.memoizedState !== null || c === null ? Vc(i) : (c.return = o, K = c);
					for (; a !== null;) K = a, Rc(a, t, n), a = a.sibling;
					K = i, gc = s, G = l;
				}
				zc(e, t, n);
			} else i.subtreeFlags & 8772 && a !== null ? (a.return = i, K = a) : zc(e, t, n);
		}
	}
	function zc(e) {
		for (; K !== null;) {
			var t = K;
			if (t.flags & 8772) {
				var n = t.alternate;
				try {
					if (t.flags & 8772) switch (t.tag) {
						case 0:
						case 11:
						case 15:
							G || Cc(5, t);
							break;
						case 1:
							var r = t.stateNode;
							if (t.flags & 4 && !G) {
								if (n === null) r.componentDidMount();
								else {
									var i = t.elementType === t.type ? n.memoizedProps : Cs(t.type, n.memoizedProps);
									r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
								}
							}
							var o = t.updateQueue;
							o !== null && go(t, o, r);
							break;
						case 3:
							var s = t.updateQueue;
							if (s !== null) {
								if (n = null, t.child !== null) switch (t.child.tag) {
									case 5:
										n = t.child.stateNode;
										break;
									case 1: n = t.child.stateNode;
								}
								go(t, s, n);
							}
							break;
						case 5:
							var c = t.stateNode;
							if (n === null && t.flags & 4) {
								n = c;
								var l = t.memoizedProps;
								switch (t.type) {
									case "button":
									case "input":
									case "select":
									case "textarea":
										l.autoFocus && n.focus();
										break;
									case "img": l.src && (n.src = l.src);
								}
							}
							break;
						case 6: break;
						case 4: break;
						case 12: break;
						case 13:
							if (t.memoizedState === null) {
								var u = t.alternate;
								if (u !== null) {
									var d = u.memoizedState;
									if (d !== null) {
										var f = d.dehydrated;
										f !== null && yn(f);
									}
								}
							}
							break;
						case 19:
						case 17:
						case 21:
						case 22:
						case 23:
						case 25: break;
						default: throw Error(a(163));
					}
					G || t.flags & 512 && wc(t);
				} catch (e) {
					$(t, t.return, e);
				}
			}
			if (t === e) {
				K = null;
				break;
			}
			if (n = t.sibling, n !== null) {
				n.return = t.return, K = n;
				break;
			}
			K = t.return;
		}
	}
	function Bc(e) {
		for (; K !== null;) {
			var t = K;
			if (t === e) {
				K = null;
				break;
			}
			var n = t.sibling;
			if (n !== null) {
				n.return = t.return, K = n;
				break;
			}
			K = t.return;
		}
	}
	function Vc(e) {
		for (; K !== null;) {
			var t = K;
			try {
				switch (t.tag) {
					case 0:
					case 11:
					case 15:
						var n = t.return;
						try {
							Cc(4, t);
						} catch (e) {
							$(t, n, e);
						}
						break;
					case 1:
						var r = t.stateNode;
						if (typeof r.componentDidMount == "function") {
							var i = t.return;
							try {
								r.componentDidMount();
							} catch (e) {
								$(t, i, e);
							}
						}
						var a = t.return;
						try {
							wc(t);
						} catch (e) {
							$(t, a, e);
						}
						break;
					case 5:
						var o = t.return;
						try {
							wc(t);
						} catch (e) {
							$(t, o, e);
						}
				}
			} catch (e) {
				$(t, t.return, e);
			}
			if (t === e) {
				K = null;
				break;
			}
			var s = t.sibling;
			if (s !== null) {
				s.return = t.return, K = s;
				break;
			}
			K = t.return;
		}
	}
	var Hc = Math.ceil, Uc = x.ReactCurrentDispatcher, Wc = x.ReactCurrentOwner, Gc = x.ReactCurrentBatchConfig, J = 0, Y = null, X = null, Z = 0, Kc = 0, qc = $i(0), Q = 0, Jc = null, Yc = 0, Xc = 0, Zc = 0, Qc = null, $c = null, el = 0, tl = Infinity, nl = null, rl = !1, il = null, al = null, ol = !1, sl = null, cl = 0, ll = 0, ul = null, dl = -1, fl = 0;
	function pl() {
		return J & 6 ? D() : dl === -1 ? dl = D() : dl;
	}
	function ml(e) {
		return e.mode & 1 ? J & 2 && Z !== 0 ? Z & -Z : Va.transition === null ? (e = k, e === 0 && (e = window.event, e = e === void 0 ? 16 : Dn(e.type)), e) : (fl === 0 && (fl = Jt()), fl) : 1;
	}
	function hl(e, t, n, r) {
		if (50 < ll) throw ll = 0, ul = null, Error(a(185));
		Xt(e, n, r), J & 2 && e === Y || (e === Y && (!(J & 2) && (Xc |= n), Q === 4 && xl(e, Z)), gl(e, r), n === 1 && J === 0 && !(t.mode & 1) && (tl = D() + 500, da && ha()));
	}
	function gl(e, t) {
		var n = e.callbackNode;
		Kt(e, t);
		var r = Wt(e, e === Y ? Z : 0);
		if (r === 0) n !== null && Et(n), e.callbackNode = null, e.callbackPriority = 0;
		else if (t = r & -r, e.callbackPriority !== t) {
			if (n != null && Et(n), t === 1) e.tag === 0 ? ma(Sl.bind(null, e)) : pa(Sl.bind(null, e)), Fi(function() {
				!(J & 6) && ha();
			}), n = null;
			else {
				switch ($t(r)) {
					case 1:
						n = At;
						break;
					case 4:
						n = jt;
						break;
					case 16:
						n = Mt;
						break;
					case 536870912:
						n = O;
						break;
					default: n = Mt;
				}
				n = Wl(n, _l.bind(null, e));
			}
			e.callbackPriority = t, e.callbackNode = n;
		}
	}
	function _l(e, t) {
		if (dl = -1, fl = 0, J & 6) throw Error(a(327));
		var n = e.callbackNode;
		if (Ll() && e.callbackNode !== n) return null;
		var r = Wt(e, e === Y ? Z : 0);
		if (r === 0) return null;
		if (r & 30 || (r & e.expiredLanes) !== 0 || t) t = Al(e, r);
		else {
			t = r;
			var i = J;
			J |= 2;
			var o = Ol();
			(Y !== e || Z !== t) && (nl = null, tl = D() + 500, El(e, t));
			do
				try {
					Ml();
					break;
				} catch (t) {
					Dl(e, t);
				}
			while (1);
			Qa(), Uc.current = o, J = i, X === null ? (Y = null, Z = 0, t = Q) : t = 0;
		}
		if (t !== 0) {
			if (t === 2 && (i = qt(e), i !== 0 && (r = i, t = vl(e, i))), t === 1) throw n = Jc, El(e, 0), xl(e, r), gl(e, D()), n;
			if (t === 6) xl(e, r);
			else {
				if (i = e.current.alternate, !(r & 30) && !bl(i) && (t = Al(e, r), t === 2 && (o = qt(e), o !== 0 && (r = o, t = vl(e, o))), t === 1)) throw n = Jc, El(e, 0), xl(e, r), gl(e, D()), n;
				switch (e.finishedWork = i, e.finishedLanes = r, t) {
					case 0:
					case 1: throw Error(a(345));
					case 2:
						Fl(e, $c, nl);
						break;
					case 3:
						if (xl(e, r), (r & 130023424) === r && (t = el + 500 - D(), 10 < t)) {
							if (Wt(e, 0) !== 0) break;
							if (i = e.suspendedLanes, (i & r) !== r) {
								pl(), e.pingedLanes |= e.suspendedLanes & i;
								break;
							}
							e.timeoutHandle = Mi(Fl.bind(null, e, $c, nl), t);
							break;
						}
						Fl(e, $c, nl);
						break;
					case 4:
						if (xl(e, r), (r & 4194240) === r) break;
						for (t = e.eventTimes, i = -1; 0 < r;) {
							var s = 31 - Lt(r);
							o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
						}
						if (r = i, r = D() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Hc(r / 1960)) - r, 10 < r) {
							e.timeoutHandle = Mi(Fl.bind(null, e, $c, nl), r);
							break;
						}
						Fl(e, $c, nl);
						break;
					case 5:
						Fl(e, $c, nl);
						break;
					default: throw Error(a(329));
				}
			}
		}
		return gl(e, D()), e.callbackNode === n ? _l.bind(null, e) : null;
	}
	function vl(e, t) {
		var n = Qc;
		return e.current.memoizedState.isDehydrated && (El(e, t).flags |= 256), e = Al(e, t), e !== 2 && (t = $c, $c = n, t !== null && yl(t)), e;
	}
	function yl(e) {
		$c === null ? $c = e : $c.push.apply($c, e);
	}
	function bl(e) {
		for (var t = e;;) {
			if (t.flags & 16384) {
				var n = t.updateQueue;
				if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
					var i = n[r], a = i.getSnapshot;
					i = i.value;
					try {
						if (!Lr(a(), i)) return !1;
					} catch {
						return !1;
					}
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function xl(e, t) {
		for (t &= ~Zc, t &= ~Xc, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
			var n = 31 - Lt(t), r = 1 << n;
			e[n] = -1, t &= ~r;
		}
	}
	function Sl(e) {
		if (J & 6) throw Error(a(327));
		Ll();
		var t = Wt(e, 0);
		if (!(t & 1)) return gl(e, D()), null;
		var n = Al(e, t);
		if (e.tag !== 0 && n === 2) {
			var r = qt(e);
			r !== 0 && (t = r, n = vl(e, r));
		}
		if (n === 1) throw n = Jc, El(e, 0), xl(e, t), gl(e, D()), n;
		if (n === 6) throw Error(a(345));
		return e.finishedWork = e.current.alternate, e.finishedLanes = t, Fl(e, $c, nl), gl(e, D()), null;
	}
	function Cl(e, t) {
		var n = J;
		J |= 1;
		try {
			return e(t);
		} finally {
			J = n, J === 0 && (tl = D() + 500, da && ha());
		}
	}
	function wl(e) {
		sl !== null && sl.tag === 0 && !(J & 6) && Ll();
		var t = J;
		J |= 1;
		var n = Gc.transition, r = k;
		try {
			if (Gc.transition = null, k = 1, e) return e();
		} finally {
			k = r, Gc.transition = n, J = t, !(J & 6) && ha();
		}
	}
	function Tl() {
		Kc = qc.current, F(qc);
	}
	function El(e, t) {
		e.finishedWork = null, e.finishedLanes = 0;
		var n = e.timeoutHandle;
		if (n !== -1 && (e.timeoutHandle = -1, Ni(n)), X !== null) for (n = X.return; n !== null;) {
			var r = n;
			switch (Oa(r), r.tag) {
				case 1:
					r = r.type.childContextTypes, r != null && aa();
					break;
				case 3:
					Co(), F(ta), F(L), Oo();
					break;
				case 5:
					To(r);
					break;
				case 4:
					Co();
					break;
				case 13:
					F(z);
					break;
				case 19:
					F(z);
					break;
				case 10:
					$a(r.type._context);
					break;
				case 22:
				case 23: Tl();
			}
			n = n.return;
		}
		if (Y = e, X = e = Yl(e.current, null), Z = Kc = t, Q = 0, Jc = null, Zc = Xc = Yc = 0, $c = Qc = null, ro !== null) {
			for (t = 0; t < ro.length; t++) if (n = ro[t], r = n.interleaved, r !== null) {
				n.interleaved = null;
				var i = r.next, a = n.pending;
				if (a !== null) {
					var o = a.next;
					a.next = i, r.next = o;
				}
				n.pending = r;
			}
			ro = null;
		}
		return e;
	}
	function Dl(e, t) {
		do {
			var n = X;
			try {
				if (Qa(), ko.current = ys, Mo) {
					for (var r = B.memoizedState; r !== null;) {
						var i = r.queue;
						i !== null && (i.pending = null), r = r.next;
					}
					Mo = !1;
				}
				if (jo = 0, H = V = B = null, No = !1, Po = 0, Wc.current = null, n === null || n.return === null) {
					Q = 1, Jc = t, X = null;
					break;
				}
				a: {
					var o = e, s = n.return, c = n, l = t;
					if (t = Z, c.flags |= 32768, typeof l == "object" && l && typeof l.then == "function") {
						var u = l, d = c, f = d.tag;
						if (!(d.mode & 1) && (f === 0 || f === 11 || f === 15)) {
							var p = d.alternate;
							p ? (d.updateQueue = p.updateQueue, d.memoizedState = p.memoizedState, d.lanes = p.lanes) : (d.updateQueue = null, d.memoizedState = null);
						}
						var m = Ls(s);
						if (m !== null) {
							m.flags &= -257, Rs(m, s, c, o, t), m.mode & 1 && Is(o, u, t), t = m, l = u;
							var h = t.updateQueue;
							if (h === null) {
								var g = /* @__PURE__ */ new Set();
								g.add(l), t.updateQueue = g;
							} else h.add(l);
							break a;
						}
						if (!(t & 1)) {
							Is(o, u, t), kl();
							break a;
						}
						l = Error(a(426));
					} else if (R && c.mode & 1) {
						var _ = Ls(s);
						if (_ !== null) {
							!(_.flags & 65536) && (_.flags |= 256), Rs(_, s, c, o, t), Ba(As(l, c));
							break a;
						}
					}
					o = l = As(l, c), Q !== 4 && (Q = 2), Qc === null ? Qc = [o] : Qc.push(o), o = s;
					do {
						switch (o.tag) {
							case 3:
								o.flags |= 65536, t &= -t, o.lanes |= t;
								var v = Ps(o, l, t);
								mo(o, v);
								break a;
							case 1:
								c = l;
								var y = o.type, b = o.stateNode;
								if (!(o.flags & 128) && (typeof y.getDerivedStateFromError == "function" || b !== null && typeof b.componentDidCatch == "function" && (al === null || !al.has(b)))) {
									o.flags |= 65536, t &= -t, o.lanes |= t;
									var ee = Fs(o, c, t);
									mo(o, ee);
									break a;
								}
						}
						o = o.return;
					} while (o !== null);
				}
				Pl(n);
			} catch (e) {
				t = e, X === n && n !== null && (X = n = n.return);
				continue;
			}
			break;
		} while (1);
	}
	function Ol() {
		var e = Uc.current;
		return Uc.current = ys, e === null ? ys : e;
	}
	function kl() {
		(Q === 0 || Q === 3 || Q === 2) && (Q = 4), Y === null || !(Yc & 268435455) && !(Xc & 268435455) || xl(Y, Z);
	}
	function Al(e, t) {
		var n = J;
		J |= 2;
		var r = Ol();
		(Y !== e || Z !== t) && (nl = null, El(e, t));
		do
			try {
				jl();
				break;
			} catch (t) {
				Dl(e, t);
			}
		while (1);
		if (Qa(), J = n, Uc.current = r, X !== null) throw Error(a(261));
		return Y = null, Z = 0, Q;
	}
	function jl() {
		for (; X !== null;) Nl(X);
	}
	function Ml() {
		for (; X !== null && !Dt();) Nl(X);
	}
	function Nl(e) {
		var t = Ul(e.alternate, e, Kc);
		e.memoizedProps = e.pendingProps, t === null ? Pl(e) : X = t, Wc.current = null;
	}
	function Pl(e) {
		var t = e;
		do {
			var n = t.alternate;
			if (e = t.return, t.flags & 32768) {
				if (n = hc(n, t), n !== null) {
					n.flags &= 32767, X = n;
					return;
				}
				if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
				else {
					Q = 6, X = null;
					return;
				}
			} else if (n = mc(n, t, Kc), n !== null) {
				X = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				X = t;
				return;
			}
			X = t = e;
		} while (t !== null);
		Q === 0 && (Q = 5);
	}
	function Fl(e, t, n) {
		var r = k, i = Gc.transition;
		try {
			Gc.transition = null, k = 1, Il(e, t, n, r);
		} finally {
			Gc.transition = i, k = r;
		}
		return null;
	}
	function Il(e, t, n, r) {
		do
			Ll();
		while (sl !== null);
		if (J & 6) throw Error(a(327));
		n = e.finishedWork;
		var i = e.finishedLanes;
		if (n === null) return null;
		if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(a(177));
		e.callbackNode = null, e.callbackPriority = 0;
		var o = n.lanes | n.childLanes;
		if (Zt(e, o), e === Y && (X = Y = null, Z = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || ol || (ol = !0, Wl(Mt, function() {
			return Ll(), null;
		})), o = !!(n.flags & 15990), n.subtreeFlags & 15990 || o) {
			o = Gc.transition, Gc.transition = null;
			var s = k;
			k = 1;
			var c = J;
			J |= 4, Wc.current = null, xc(e, n), Fc(n, e), Wr(Ai), xn = !!ki, Ai = ki = null, e.current = n, Lc(n, e, i), Ot(), J = c, k = s, Gc.transition = o;
		} else e.current = n;
		if (ol && (ol = !1, sl = e, cl = i), o = e.pendingLanes, o === 0 && (al = null), It(n.stateNode, r), gl(e, D()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, {
			componentStack: i.stack,
			digest: i.digest
		});
		if (rl) throw rl = !1, e = il, il = null, e;
		return cl & 1 && e.tag !== 0 && Ll(), o = e.pendingLanes, o & 1 ? e === ul ? ll++ : (ll = 0, ul = e) : ll = 0, ha(), null;
	}
	function Ll() {
		if (sl !== null) {
			var e = $t(cl), t = Gc.transition, n = k;
			try {
				if (Gc.transition = null, k = 16 > e ? 16 : e, sl === null) var r = !1;
				else {
					if (e = sl, sl = null, cl = 0, J & 6) throw Error(a(331));
					var i = J;
					for (J |= 4, K = e.current; K !== null;) {
						var o = K, s = o.child;
						if (K.flags & 16) {
							var c = o.deletions;
							if (c !== null) {
								for (var l = 0; l < c.length; l++) {
									var u = c[l];
									for (K = u; K !== null;) {
										var d = K;
										switch (d.tag) {
											case 0:
											case 11:
											case 15: Sc(8, d, o);
										}
										var f = d.child;
										if (f !== null) f.return = d, K = f;
										else for (; K !== null;) {
											d = K;
											var p = d.sibling, m = d.return;
											if (Tc(d), d === u) {
												K = null;
												break;
											}
											if (p !== null) {
												p.return = m, K = p;
												break;
											}
											K = m;
										}
									}
								}
								var h = o.alternate;
								if (h !== null) {
									var g = h.child;
									if (g !== null) {
										h.child = null;
										do {
											var _ = g.sibling;
											g.sibling = null, g = _;
										} while (g !== null);
									}
								}
								K = o;
							}
						}
						if (o.subtreeFlags & 2064 && s !== null) s.return = o, K = s;
						else b: for (; K !== null;) {
							if (o = K, o.flags & 2048) switch (o.tag) {
								case 0:
								case 11:
								case 15: Sc(9, o, o.return);
							}
							var v = o.sibling;
							if (v !== null) {
								v.return = o.return, K = v;
								break b;
							}
							K = o.return;
						}
					}
					var y = e.current;
					for (K = y; K !== null;) {
						s = K;
						var b = s.child;
						if (s.subtreeFlags & 2064 && b !== null) b.return = s, K = b;
						else b: for (s = y; K !== null;) {
							if (c = K, c.flags & 2048) try {
								switch (c.tag) {
									case 0:
									case 11:
									case 15: Cc(9, c);
								}
							} catch (e) {
								$(c, c.return, e);
							}
							if (c === s) {
								K = null;
								break b;
							}
							var ee = c.sibling;
							if (ee !== null) {
								ee.return = c.return, K = ee;
								break b;
							}
							K = c.return;
						}
					}
					if (J = i, ha(), Ft && typeof Ft.onPostCommitFiberRoot == "function") try {
						Ft.onPostCommitFiberRoot(Pt, e);
					} catch {}
					r = !0;
				}
				return r;
			} finally {
				k = n, Gc.transition = t;
			}
		}
		return !1;
	}
	function Rl(e, t, n) {
		t = As(n, t), t = Ps(e, t, 1), e = fo(e, t, 1), t = pl(), e !== null && (Xt(e, 1, t), gl(e, t));
	}
	function $(e, t, n) {
		if (e.tag === 3) Rl(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Rl(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (al === null || !al.has(r))) {
					e = As(n, e), e = Fs(t, e, 1), t = fo(t, e, 1), e = pl(), t !== null && (Xt(t, 1, e), gl(t, e));
					break;
				}
			}
			t = t.return;
		}
	}
	function zl(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), t = pl(), e.pingedLanes |= e.suspendedLanes & n, Y === e && (Z & n) === n && (Q === 4 || Q === 3 && (Z & 130023424) === Z && 500 > D() - el ? El(e, 0) : Zc |= n), gl(e, t);
	}
	function Bl(e, t) {
		t === 0 && (e.mode & 1 ? (t = Ht, Ht <<= 1, !(Ht & 130023424) && (Ht = 4194304)) : t = 1);
		var n = pl();
		e = oo(e, t), e !== null && (Xt(e, t, n), gl(e, n));
	}
	function Vl(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), Bl(e, n);
	}
	function Hl(e, t) {
		var n = 0;
		switch (e.tag) {
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			default: throw Error(a(314));
		}
		r !== null && r.delete(t), Bl(e, n);
	}
	var Ul = function(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps || ta.current) Bs = !0;
			else {
				if ((e.lanes & n) === 0 && !(t.flags & 128)) return Bs = !1, lc(e, t, n);
				Bs = !!(e.flags & 131072);
			}
		} else Bs = !1, R && t.flags & 1048576 && Ea(t, ya, t.index);
		switch (t.lanes = 0, t.tag) {
			case 2:
				var r = t.type;
				sc(e, t), e = t.pendingProps;
				var i = ra(t, L.current);
				to(t, n), i = Lo(null, t, r, e, i, n);
				var o = Ro();
				return t.flags |= 1, typeof i == "object" && i && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, ia(r) ? (o = !0, ca(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, co(t), i.updater = Ts, t.stateNode = i, i._reactInternals = t, ks(t, r, e, n), t = Ys(null, t, r, !0, o, n)) : (t.tag = 0, R && o && Da(t), Vs(null, t, i, n), t = t.child), t;
			case 16:
				r = t.elementType;
				a: {
					switch (sc(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = Jl(r), e = Cs(r, e), i) {
						case 0:
							t = qs(null, t, r, e, n);
							break a;
						case 1:
							t = Js(null, t, r, e, n);
							break a;
						case 11:
							t = Hs(null, t, r, e, n);
							break a;
						case 14:
							t = Us(null, t, r, Cs(r.type, e), n);
							break a;
					}
					throw Error(a(306, r, ""));
				}
				return t;
			case 0: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : Cs(r, i), qs(e, t, r, i, n);
			case 1: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : Cs(r, i), Js(e, t, r, i, n);
			case 3:
				a: {
					if (Xs(t), e === null) throw Error(a(387));
					r = t.pendingProps, o = t.memoizedState, i = o.element, lo(e, t), ho(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache,
							pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
							transitions: s.transitions
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							i = As(Error(a(423)), t), t = Zs(e, t, r, n, i);
							break a;
						}
						if (r !== i) {
							i = As(Error(a(424)), t), t = Zs(e, t, r, n, i);
							break a;
						}
						for (Aa = Ri(t.stateNode.containerInfo.firstChild), ka = t, R = !0, ja = null, n = qa(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (za(), r === i) {
							t = cc(e, t, n);
							break a;
						}
						Vs(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 5: return wo(t), e === null && Fa(t), r = t.type, i = t.pendingProps, o = e === null ? null : e.memoizedProps, s = i.children, ji(r, i) ? s = null : o !== null && ji(r, o) && (t.flags |= 32), Ks(e, t), Vs(e, t, s, n), t.child;
			case 6: return e === null && Fa(t), null;
			case 13: return ec(e, t, n);
			case 4: return So(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Ka(t, null, r, n) : Vs(e, t, r, n), t.child;
			case 11: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : Cs(r, i), Hs(e, t, r, i, n);
			case 7: return Vs(e, t, t.pendingProps, n), t.child;
			case 8: return Vs(e, t, t.pendingProps.children, n), t.child;
			case 12: return Vs(e, t, t.pendingProps.children, n), t.child;
			case 10:
				a: {
					if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, I(Ja, r._currentValue), r._currentValue = s, o !== null) {
						if (Lr(o.value, s)) {
							if (o.children === i.children && !ta.current) {
								t = cc(e, t, n);
								break a;
							}
						} else for (o = t.child, o !== null && (o.return = t); o !== null;) {
							var c = o.dependencies;
							if (c !== null) {
								s = o.child;
								for (var l = c.firstContext; l !== null;) {
									if (l.context === r) {
										if (o.tag === 1) {
											l = uo(-1, n & -n), l.tag = 2;
											var u = o.updateQueue;
											if (u !== null) {
												u = u.shared;
												var d = u.pending;
												d === null ? l.next = l : (l.next = d.next, d.next = l), u.pending = l;
											}
										}
										o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), eo(o.return, n, t), c.lanes |= n;
										break;
									}
									l = l.next;
								}
							} else if (o.tag === 10) s = o.type === t.type ? null : o.child;
							else if (o.tag === 18) {
								if (s = o.return, s === null) throw Error(a(341));
								s.lanes |= n, c = s.alternate, c !== null && (c.lanes |= n), eo(s, n, t), s = o.sibling;
							} else s = o.child;
							if (s !== null) s.return = o;
							else for (s = o; s !== null;) {
								if (s === t) {
									s = null;
									break;
								}
								if (o = s.sibling, o !== null) {
									o.return = s.return, s = o;
									break;
								}
								s = s.return;
							}
							o = s;
						}
					}
					Vs(e, t, i.children, n), t = t.child;
				}
				return t;
			case 9: return i = t.type, r = t.pendingProps.children, to(t, n), i = no(i), r = r(i), t.flags |= 1, Vs(e, t, r, n), t.child;
			case 14: return r = t.type, i = Cs(r, t.pendingProps), i = Cs(r.type, i), Us(e, t, r, i, n);
			case 15: return Ws(e, t, t.type, t.pendingProps, n);
			case 17: return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : Cs(r, i), sc(e, t), t.tag = 1, ia(r) ? (e = !0, ca(t)) : e = !1, to(t, n), Ds(t, r, i), ks(t, r, i, n), Ys(null, t, r, !0, e, n);
			case 19: return oc(e, t, n);
			case 22: return Gs(e, t, n);
		}
		throw Error(a(156, t.tag));
	};
	function Wl(e, t) {
		return E(e, t);
	}
	function Gl(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Kl(e, t, n, r) {
		return new Gl(e, t, n, r);
	}
	function ql(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Jl(e) {
		if (typeof e == "function") return +!!ql(e);
		if (e != null) {
			if (e = e.$$typeof, e === le) return 11;
			if (e === S) return 14;
		}
		return 2;
	}
	function Yl(e, t) {
		var n = e.alternate;
		return n === null ? (n = Kl(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
	}
	function Xl(e, t, n, r, i, o) {
		var s = 2;
		if (r = e, typeof e == "function") ql(e) && (s = 1);
		else if (typeof e == "string") s = 5;
		else a: switch (e) {
			case ie: return Zl(n.children, i, o, t);
			case ae:
				s = 8, i |= 8;
				break;
			case oe: return e = Kl(12, n, t, i | 2), e.elementType = oe, e.lanes = o, e;
			case ue: return e = Kl(13, n, t, i), e.elementType = ue, e.lanes = o, e;
			case de: return e = Kl(19, n, t, i), e.elementType = de, e.lanes = o, e;
			case pe: return Ql(n, i, o, t);
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case se:
						s = 10;
						break a;
					case ce:
						s = 9;
						break a;
					case le:
						s = 11;
						break a;
					case S:
						s = 14;
						break a;
					case fe:
						s = 16, r = null;
						break a;
				}
				throw Error(a(130, e == null ? e : typeof e, ""));
		}
		return t = Kl(s, n, t, i), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Zl(e, t, n, r) {
		return e = Kl(7, e, r, t), e.lanes = n, e;
	}
	function Ql(e, t, n, r) {
		return e = Kl(22, e, r, t), e.elementType = pe, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
	}
	function $l(e, t, n) {
		return e = Kl(6, e, null, t), e.lanes = n, e;
	}
	function eu(e, t, n) {
		return t = Kl(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	function tu(e, t, n, r, i) {
		this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Yt(0), this.expirationTimes = Yt(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Yt(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
	}
	function nu(e, t, n, r, i, a, o, s, c) {
		return e = new tu(e, t, n, s, c), t === 1 ? (t = 1, !0 === a && (t |= 8)) : t = 0, a = Kl(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: null,
			transitions: null,
			pendingSuspenseBoundaries: null
		}, co(a), e;
	}
	function ru(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: re,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	function iu(e) {
		if (!e) return ea;
		e = e._reactInternals;
		a: {
			if (bt(e) !== e || e.tag !== 1) throw Error(a(170));
			var t = e;
			do {
				switch (t.tag) {
					case 3:
						t = t.stateNode.context;
						break a;
					case 1: if (ia(t.type)) {
						t = t.stateNode.__reactInternalMemoizedMergedChildContext;
						break a;
					}
				}
				t = t.return;
			} while (t !== null);
			throw Error(a(171));
		}
		if (e.tag === 1) {
			var n = e.type;
			if (ia(n)) return sa(e, n, t);
		}
		return t;
	}
	function au(e, t, n, r, i, a, o, s, c) {
		return e = nu(n, r, !0, e, i, a, o, s, c), e.context = iu(null), n = e.current, r = pl(), i = ml(n), a = uo(r, i), a.callback = t ?? null, fo(n, a, i), e.current.lanes = i, Xt(e, i, r), gl(e, r), e;
	}
	function ou(e, t, n, r) {
		var i = t.current, a = pl(), o = ml(i);
		return n = iu(n), t.context === null ? t.context = n : t.pendingContext = n, t = uo(a, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = fo(i, t, o), e !== null && (hl(e, i, o, a), po(e, i, o)), o;
	}
	function su(e) {
		if (e = e.current, !e.child) return null;
		switch (e.child.tag) {
			case 5: return e.child.stateNode;
			default: return e.child.stateNode;
		}
	}
	function cu(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function lu(e, t) {
		cu(e, t), (e = e.alternate) && cu(e, t);
	}
	function uu() {
		return null;
	}
	var du = typeof reportError == "function" ? reportError : function(e) {
		console.error(e);
	};
	function fu(e) {
		this._internalRoot = e;
	}
	pu.prototype.render = fu.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(a(409));
		ou(e, t, null, null);
	}, pu.prototype.unmount = fu.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			wl(function() {
				ou(null, e, null, null);
			}), t[Ui] = null;
		}
	};
	function pu(e) {
		this._internalRoot = e;
	}
	pu.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = nn();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < j.length && t !== 0 && t < j[n].priority; n++);
			j.splice(n, 0, e), n === 0 && M(e);
		}
	};
	function mu(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function hu(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
	}
	function gu() {}
	function _u(e, t, n, r, i) {
		if (i) {
			if (typeof r == "function") {
				var a = r;
				r = function() {
					var e = su(o);
					a.call(e);
				};
			}
			var o = au(t, r, e, 0, null, !1, !1, "", gu);
			return e._reactRootContainer = o, e[Ui] = o.current, _i(e.nodeType === 8 ? e.parentNode : e), wl(), o;
		}
		for (; i = e.lastChild;) e.removeChild(i);
		if (typeof r == "function") {
			var s = r;
			r = function() {
				var e = su(c);
				s.call(e);
			};
		}
		var c = nu(e, 0, !1, null, null, !1, !1, "", gu);
		return e._reactRootContainer = c, e[Ui] = c.current, _i(e.nodeType === 8 ? e.parentNode : e), wl(function() {
			ou(t, c, n, r);
		}), c;
	}
	function vu(e, t, n, r, i) {
		var a = n._reactRootContainer;
		if (a) {
			var o = a;
			if (typeof i == "function") {
				var s = i;
				i = function() {
					var e = su(o);
					s.call(e);
				};
			}
			ou(t, o, e, i);
		} else o = _u(n, t, e, i, r);
		return su(o);
	}
	en = function(e) {
		switch (e.tag) {
			case 3:
				var t = e.stateNode;
				if (t.current.memoizedState.isDehydrated) {
					var n = Ut(t.pendingLanes);
					n !== 0 && (Qt(t, n | 1), gl(t, D()), !(J & 6) && (tl = D() + 500, ha()));
				}
				break;
			case 13: wl(function() {
				var t = oo(e, 1);
				t !== null && hl(t, e, 1, pl());
			}), lu(e, 1);
		}
	}, tn = function(e) {
		if (e.tag === 13) {
			var t = oo(e, 134217728);
			t !== null && hl(t, e, 134217728, pl()), lu(e, 134217728);
		}
	}, A = function(e) {
		if (e.tag === 13) {
			var t = ml(e), n = oo(e, t);
			n !== null && hl(n, e, t, pl()), lu(e, t);
		}
	}, nn = function() {
		return k;
	}, rn = function(e, t) {
		var n = k;
		try {
			return k = e, t();
		} finally {
			k = n;
		}
	}, et = function(e, t, n) {
		switch (t) {
			case "input":
				if (je(e, n), t = n.name, n.type === "radio" && t != null) {
					for (n = e; n.parentNode;) n = n.parentNode;
					for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + "][type=\"radio\"]"), t = 0; t < n.length; t++) {
						var r = n[t];
						if (r !== e && r.form === e.form) {
							var i = Xi(r);
							if (!i) throw Error(a(90));
							w(r), je(r, i);
						}
					}
				}
				break;
			case "textarea":
				Re(e, n);
				break;
			case "select": t = n.value, t != null && Fe(e, !!n.multiple, t, !1);
		}
	}, ot = Cl, st = wl;
	var yu = {
		usingClientEntryPoint: !1,
		Events: [
			Ji,
			Yi,
			Xi,
			it,
			at,
			Cl
		]
	}, bu = {
		findFiberByHostInstance: qi,
		bundleType: 0,
		version: "18.3.1",
		rendererPackageName: "react-dom"
	}, xu = {
		bundleType: bu.bundleType,
		version: bu.version,
		rendererPackageName: bu.rendererPackageName,
		rendererConfig: bu.rendererConfig,
		overrideHookState: null,
		overrideHookStateDeletePath: null,
		overrideHookStateRenamePath: null,
		overrideProps: null,
		overridePropsDeletePath: null,
		overridePropsRenamePath: null,
		setErrorHandler: null,
		setSuspenseHandler: null,
		scheduleUpdate: null,
		currentDispatcherRef: x.ReactCurrentDispatcher,
		findHostInstanceByFiber: function(e) {
			return e = wt(e), e === null ? null : e.stateNode;
		},
		findFiberByHostInstance: bu.findFiberByHostInstance || uu,
		findHostInstancesForRefresh: null,
		scheduleRefresh: null,
		scheduleRoot: null,
		setRefreshHandler: null,
		getCurrentFiber: null,
		reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Su = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Su.isDisabled && Su.supportsFiber) try {
			Pt = Su.inject(xu), Ft = Su;
		} catch {}
	}
	e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yu, e.createPortal = function(e, t) {
		var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!mu(t)) throw Error(a(200));
		return ru(e, t, null, n);
	}, e.createRoot = function(e, t) {
		if (!mu(e)) throw Error(a(299));
		var n = !1, r = "", i = du;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = nu(e, 1, !1, null, null, n, !1, r, i), e[Ui] = t.current, _i(e.nodeType === 8 ? e.parentNode : e), new fu(t);
	}, e.findDOMNode = function(e) {
		if (e == null) return null;
		if (e.nodeType === 1) return e;
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(a(188)) : (e = Object.keys(e).join(","), Error(a(268, e)));
		return e = wt(t), e = e === null ? null : e.stateNode, e;
	}, e.flushSync = function(e) {
		return wl(e);
	}, e.hydrate = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !0, n);
	}, e.hydrateRoot = function(e, t, n) {
		if (!mu(e)) throw Error(a(405));
		var r = n != null && n.hydratedSources || null, i = !1, o = "", s = du;
		if (n != null && (!0 === n.unstable_strictMode && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = au(t, null, e, 1, n ?? null, i, !1, o, s), e[Ui] = t.current, _i(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
		return new pu(t);
	}, e.render = function(e, t, n) {
		if (!hu(t)) throw Error(a(200));
		return vu(null, e, t, !1, n);
	}, e.unmountComponentAtNode = function(e) {
		if (!hu(e)) throw Error(a(40));
		return e._reactRootContainer ? (wl(function() {
			vu(null, null, e, !1, function() {
				e._reactRootContainer = null, e[Ui] = null;
			});
		}), !0) : !1;
	}, e.unstable_batchedUpdates = Cl, e.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
		if (!hu(n)) throw Error(a(200));
		if (e == null || e._reactInternals === void 0) throw Error(a(38));
		return vu(e, t, n, !1, r);
	}, e.version = "18.3.1-next-f1338f8080-20240426";
})), o = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = a();
})), s = /* @__PURE__ */ e(((e) => {
	var t = o();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})), c = 6048e5, l = 864e5, u = 6e4, d = 36e5, f = Symbol.for("constructDateFrom");
// node_modules/date-fns/constructFrom.js
function p(e, t) {
	return typeof e == "function" ? e(t) : e && typeof e == "object" && f in e ? e[f](t) : e instanceof Date ? new e.constructor(t) : new Date(t);
}
// node_modules/date-fns/toDate.js
function m(e, t) {
	return p(t || e, e);
}
// node_modules/date-fns/addDays.js
function h(e, t, n) {
	let r = m(e, n?.in);
	return isNaN(t) ? p(n?.in || e, NaN) : (t && r.setDate(r.getDate() + t), r);
}
// node_modules/date-fns/addMonths.js
function g(e, t, n) {
	let r = m(e, n?.in);
	if (isNaN(t)) return p(n?.in || e, NaN);
	if (!t) return r;
	let i = r.getDate(), a = p(n?.in || e, r.getTime());
	return a.setMonth(r.getMonth() + t + 1, 0), i >= a.getDate() ? a : (r.setFullYear(a.getFullYear(), a.getMonth(), i), r);
}
// node_modules/date-fns/_lib/defaultOptions.js
var _ = {};
function v() {
	return _;
}
// node_modules/date-fns/startOfWeek.js
function y(e, t) {
	let n = v(), r = t?.weekStartsOn ?? t?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, i = m(e, t?.in), a = i.getDay(), o = (a < r ? 7 : 0) + a - r;
	return i.setDate(i.getDate() - o), i.setHours(0, 0, 0, 0), i;
}
// node_modules/date-fns/startOfISOWeek.js
function b(e, t) {
	return y(e, {
		...t,
		weekStartsOn: 1
	});
}
// node_modules/date-fns/getISOWeekYear.js
function ee(e, t) {
	let n = m(e, t?.in), r = n.getFullYear(), i = p(n, 0);
	i.setFullYear(r + 1, 0, 4), i.setHours(0, 0, 0, 0);
	let a = b(i), o = p(n, 0);
	o.setFullYear(r, 0, 4), o.setHours(0, 0, 0, 0);
	let s = b(o);
	return n.getTime() >= a.getTime() ? r + 1 : n.getTime() >= s.getTime() ? r : r - 1;
}
// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function te(e) {
	let t = m(e), n = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()));
	return n.setUTCFullYear(t.getFullYear()), +e - n;
}
// node_modules/date-fns/_lib/normalizeDates.js
function x(e, ...t) {
	let n = p.bind(null, e || t.find((e) => typeof e == "object"));
	return t.map(n);
}
// node_modules/date-fns/startOfDay.js
function ne(e, t) {
	let n = m(e, t?.in);
	return n.setHours(0, 0, 0, 0), n;
}
// node_modules/date-fns/differenceInCalendarDays.js
function re(e, t, n) {
	let [r, i] = x(n?.in, e, t), a = ne(r), o = ne(i), s = +a - te(a), c = +o - te(o);
	return Math.round((s - c) / l);
}
// node_modules/date-fns/startOfISOWeekYear.js
function ie(e, t) {
	let n = ee(e, t), r = p(t?.in || e, 0);
	return r.setFullYear(n, 0, 4), r.setHours(0, 0, 0, 0), b(r);
}
// node_modules/date-fns/isDate.js
function ae(e) {
	return e instanceof Date || typeof e == "object" && Object.prototype.toString.call(e) === "[object Date]";
}
// node_modules/date-fns/isValid.js
function oe(e) {
	return !(!ae(e) && typeof e != "number" || isNaN(+m(e)));
}
// node_modules/date-fns/differenceInCalendarWeeks.js
function se(e, t, n) {
	let [r, i] = x(n?.in, e, t), a = y(r, n), o = y(i, n), s = +a - te(a), l = +o - te(o);
	return Math.round((s - l) / c);
}
// node_modules/date-fns/endOfMonth.js
function ce(e, t) {
	let n = m(e, t?.in), r = n.getMonth();
	return n.setFullYear(n.getFullYear(), r + 1, 0), n.setHours(23, 59, 59, 999), n;
}
// node_modules/date-fns/startOfMonth.js
function le(e, t) {
	let n = m(e, t?.in);
	return n.setDate(1), n.setHours(0, 0, 0, 0), n;
}
// node_modules/date-fns/startOfYear.js
function ue(e, t) {
	let n = m(e, t?.in);
	return n.setFullYear(n.getFullYear(), 0, 1), n.setHours(0, 0, 0, 0), n;
}
// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var de = {
	lessThanXSeconds: {
		one: "less than a second",
		other: "less than {{count}} seconds"
	},
	xSeconds: {
		one: "1 second",
		other: "{{count}} seconds"
	},
	halfAMinute: "half a minute",
	lessThanXMinutes: {
		one: "less than a minute",
		other: "less than {{count}} minutes"
	},
	xMinutes: {
		one: "1 minute",
		other: "{{count}} minutes"
	},
	aboutXHours: {
		one: "about 1 hour",
		other: "about {{count}} hours"
	},
	xHours: {
		one: "1 hour",
		other: "{{count}} hours"
	},
	xDays: {
		one: "1 day",
		other: "{{count}} days"
	},
	aboutXWeeks: {
		one: "about 1 week",
		other: "about {{count}} weeks"
	},
	xWeeks: {
		one: "1 week",
		other: "{{count}} weeks"
	},
	aboutXMonths: {
		one: "about 1 month",
		other: "about {{count}} months"
	},
	xMonths: {
		one: "1 month",
		other: "{{count}} months"
	},
	aboutXYears: {
		one: "about 1 year",
		other: "about {{count}} years"
	},
	xYears: {
		one: "1 year",
		other: "{{count}} years"
	},
	overXYears: {
		one: "over 1 year",
		other: "over {{count}} years"
	},
	almostXYears: {
		one: "almost 1 year",
		other: "almost {{count}} years"
	}
}, S = (e, t, n) => {
	let r, i = de[e];
	return r = typeof i == "string" ? i : t === 1 ? i.one : i.other.replace("{{count}}", t.toString()), n?.addSuffix ? n.comparison && n.comparison > 0 ? "in " + r : r + " ago" : r;
};
// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function fe(e) {
	return (t = {}) => {
		let n = t.width ? String(t.width) : e.defaultWidth;
		return e.formats[n] || e.formats[e.defaultWidth];
	};
}
var pe = {
	date: fe({
		formats: {
			full: "EEEE, MMMM do, y",
			long: "MMMM do, y",
			medium: "MMM d, y",
			short: "MM/dd/yyyy"
		},
		defaultWidth: "full"
	}),
	time: fe({
		formats: {
			full: "h:mm:ss a zzzz",
			long: "h:mm:ss a z",
			medium: "h:mm:ss a",
			short: "h:mm a"
		},
		defaultWidth: "full"
	}),
	dateTime: fe({
		formats: {
			full: "{{date}} 'at' {{time}}",
			long: "{{date}} 'at' {{time}}",
			medium: "{{date}}, {{time}}",
			short: "{{date}}, {{time}}"
		},
		defaultWidth: "full"
	})
}, me = {
	lastWeek: "'last' eeee 'at' p",
	yesterday: "'yesterday at' p",
	today: "'today at' p",
	tomorrow: "'tomorrow at' p",
	nextWeek: "eeee 'at' p",
	other: "P"
}, he = (e, t, n, r) => me[e];
// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function C(e) {
	return (t, n) => {
		let r = n?.context ? String(n.context) : "standalone", i;
		if (r === "formatting" && e.formattingValues) {
			let t = e.defaultFormattingWidth || e.defaultWidth, r = n?.width ? String(n.width) : t;
			i = e.formattingValues[r] || e.formattingValues[t];
		} else {
			let t = e.defaultWidth, r = n?.width ? String(n.width) : e.defaultWidth;
			i = e.values[r] || e.values[t];
		}
		let a = e.argumentCallback ? e.argumentCallback(t) : t;
		return i[a];
	};
}
var ge = {
	ordinalNumber: (e, t) => {
		let n = Number(e), r = n % 100;
		if (r > 20 || r < 10) switch (r % 10) {
			case 1: return n + "st";
			case 2: return n + "nd";
			case 3: return n + "rd";
		}
		return n + "th";
	},
	era: C({
		values: {
			narrow: ["B", "A"],
			abbreviated: ["BC", "AD"],
			wide: ["Before Christ", "Anno Domini"]
		},
		defaultWidth: "wide"
	}),
	quarter: C({
		values: {
			narrow: [
				"1",
				"2",
				"3",
				"4"
			],
			abbreviated: [
				"Q1",
				"Q2",
				"Q3",
				"Q4"
			],
			wide: [
				"1st quarter",
				"2nd quarter",
				"3rd quarter",
				"4th quarter"
			]
		},
		defaultWidth: "wide",
		argumentCallback: (e) => e - 1
	}),
	month: C({
		values: {
			narrow: [
				"J",
				"F",
				"M",
				"A",
				"M",
				"J",
				"J",
				"A",
				"S",
				"O",
				"N",
				"D"
			],
			abbreviated: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			wide: [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			]
		},
		defaultWidth: "wide"
	}),
	day: C({
		values: {
			narrow: [
				"S",
				"M",
				"T",
				"W",
				"T",
				"F",
				"S"
			],
			short: [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			abbreviated: [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			wide: [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			]
		},
		defaultWidth: "wide"
	}),
	dayPeriod: C({
		values: {
			narrow: {
				am: "a",
				pm: "p",
				midnight: "mi",
				noon: "n",
				morning: "morning",
				afternoon: "afternoon",
				evening: "evening",
				night: "night"
			},
			abbreviated: {
				am: "AM",
				pm: "PM",
				midnight: "midnight",
				noon: "noon",
				morning: "morning",
				afternoon: "afternoon",
				evening: "evening",
				night: "night"
			},
			wide: {
				am: "a.m.",
				pm: "p.m.",
				midnight: "midnight",
				noon: "noon",
				morning: "morning",
				afternoon: "afternoon",
				evening: "evening",
				night: "night"
			}
		},
		defaultWidth: "wide",
		formattingValues: {
			narrow: {
				am: "a",
				pm: "p",
				midnight: "mi",
				noon: "n",
				morning: "in the morning",
				afternoon: "in the afternoon",
				evening: "in the evening",
				night: "at night"
			},
			abbreviated: {
				am: "AM",
				pm: "PM",
				midnight: "midnight",
				noon: "noon",
				morning: "in the morning",
				afternoon: "in the afternoon",
				evening: "in the evening",
				night: "at night"
			},
			wide: {
				am: "a.m.",
				pm: "p.m.",
				midnight: "midnight",
				noon: "noon",
				morning: "in the morning",
				afternoon: "in the afternoon",
				evening: "in the evening",
				night: "at night"
			}
		},
		defaultFormattingWidth: "wide"
	})
};
// node_modules/date-fns/locale/_lib/buildMatchFn.js
function _e(e) {
	return (t, n = {}) => {
		let r = n.width, i = r && e.matchPatterns[r] || e.matchPatterns[e.defaultMatchWidth], a = t.match(i);
		if (!a) return null;
		let o = a[0], s = r && e.parsePatterns[r] || e.parsePatterns[e.defaultParseWidth], c = Array.isArray(s) ? ye(s, (e) => e.test(o)) : ve(s, (e) => e.test(o)), l;
		l = e.valueCallback ? e.valueCallback(c) : c, l = n.valueCallback ? n.valueCallback(l) : l;
		let u = t.slice(o.length);
		return {
			value: l,
			rest: u
		};
	};
}
function ve(e, t) {
	for (let n in e) if (Object.prototype.hasOwnProperty.call(e, n) && t(e[n])) return n;
}
function ye(e, t) {
	for (let n = 0; n < e.length; n++) if (t(e[n])) return n;
}
// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function be(e) {
	return (t, n = {}) => {
		let r = t.match(e.matchPattern);
		if (!r) return null;
		let i = r[0], a = t.match(e.parsePattern);
		if (!a) return null;
		let o = e.valueCallback ? e.valueCallback(a[0]) : a[0];
		o = n.valueCallback ? n.valueCallback(o) : o;
		let s = t.slice(i.length);
		return {
			value: o,
			rest: s
		};
	};
}
// node_modules/date-fns/locale/en-US.js
var xe = {
	code: "en-US",
	formatDistance: S,
	formatLong: pe,
	formatRelative: he,
	localize: ge,
	match: {
		ordinalNumber: be({
			matchPattern: /^(\d+)(th|st|nd|rd)?/i,
			parsePattern: /\d+/i,
			valueCallback: (e) => parseInt(e, 10)
		}),
		era: _e({
			matchPatterns: {
				narrow: /^(b|a)/i,
				abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
				wide: /^(before christ|before common era|anno domini|common era)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [/^b/i, /^(a|c)/i] },
			defaultParseWidth: "any"
		}),
		quarter: _e({
			matchPatterns: {
				narrow: /^[1234]/i,
				abbreviated: /^q[1234]/i,
				wide: /^[1234](th|st|nd|rd)? quarter/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [
				/1/i,
				/2/i,
				/3/i,
				/4/i
			] },
			defaultParseWidth: "any",
			valueCallback: (e) => e + 1
		}),
		month: _e({
			matchPatterns: {
				narrow: /^[jfmasond]/i,
				abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
				wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^j/i,
					/^f/i,
					/^m/i,
					/^a/i,
					/^m/i,
					/^j/i,
					/^j/i,
					/^a/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				],
				any: [
					/^ja/i,
					/^f/i,
					/^mar/i,
					/^ap/i,
					/^may/i,
					/^jun/i,
					/^jul/i,
					/^au/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				]
			},
			defaultParseWidth: "any"
		}),
		day: _e({
			matchPatterns: {
				narrow: /^[smtwf]/i,
				short: /^(su|mo|tu|we|th|fr|sa)/i,
				abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
				wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^s/i,
					/^m/i,
					/^t/i,
					/^w/i,
					/^t/i,
					/^f/i,
					/^s/i
				],
				any: [
					/^su/i,
					/^m/i,
					/^tu/i,
					/^w/i,
					/^th/i,
					/^f/i,
					/^sa/i
				]
			},
			defaultParseWidth: "any"
		}),
		dayPeriod: _e({
			matchPatterns: {
				narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
				any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
			},
			defaultMatchWidth: "any",
			parsePatterns: { any: {
				am: /^a/i,
				pm: /^p/i,
				midnight: /^mi/i,
				noon: /^no/i,
				morning: /morning/i,
				afternoon: /afternoon/i,
				evening: /evening/i,
				night: /night/i
			} },
			defaultParseWidth: "any"
		})
	},
	options: {
		weekStartsOn: 0,
		firstWeekContainsDate: 1
	}
};
// node_modules/date-fns/getDayOfYear.js
function Se(e, t) {
	let n = m(e, t?.in);
	return re(n, ue(n)) + 1;
}
// node_modules/date-fns/getISOWeek.js
function Ce(e, t) {
	let n = m(e, t?.in), r = +b(n) - ie(n);
	return Math.round(r / c) + 1;
}
// node_modules/date-fns/getWeekYear.js
function we(e, t) {
	let n = m(e, t?.in), r = n.getFullYear(), i = v(), a = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? i.firstWeekContainsDate ?? i.locale?.options?.firstWeekContainsDate ?? 1, o = p(t?.in || e, 0);
	o.setFullYear(r + 1, 0, a), o.setHours(0, 0, 0, 0);
	let s = y(o, t), c = p(t?.in || e, 0);
	c.setFullYear(r, 0, a), c.setHours(0, 0, 0, 0);
	let l = y(c, t);
	return +n >= +s ? r + 1 : +n >= +l ? r : r - 1;
}
// node_modules/date-fns/startOfWeekYear.js
function Te(e, t) {
	let n = v(), r = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? n.firstWeekContainsDate ?? n.locale?.options?.firstWeekContainsDate ?? 1, i = we(e, t), a = p(t?.in || e, 0);
	return a.setFullYear(i, 0, r), a.setHours(0, 0, 0, 0), y(a, t);
}
// node_modules/date-fns/getWeek.js
function Ee(e, t) {
	let n = m(e, t?.in), r = +y(n, t) - Te(n, t);
	return Math.round(r / c) + 1;
}
// node_modules/date-fns/_lib/addLeadingZeros.js
function w(e, t) {
	return (e < 0 ? "-" : "") + Math.abs(e).toString().padStart(t, "0");
}
// node_modules/date-fns/_lib/format/lightFormatters.js
var De = {
	y(e, t) {
		let n = e.getFullYear(), r = n > 0 ? n : 1 - n;
		return w(t === "yy" ? r % 100 : r, t.length);
	},
	M(e, t) {
		let n = e.getMonth();
		return t === "M" ? String(n + 1) : w(n + 1, 2);
	},
	d(e, t) {
		return w(e.getDate(), t.length);
	},
	a(e, t) {
		let n = e.getHours() / 12 >= 1 ? "pm" : "am";
		switch (t) {
			case "a":
			case "aa": return n.toUpperCase();
			case "aaa": return n;
			case "aaaaa": return n[0];
			default: return n === "am" ? "a.m." : "p.m.";
		}
	},
	h(e, t) {
		return w(e.getHours() % 12 || 12, t.length);
	},
	H(e, t) {
		return w(e.getHours(), t.length);
	},
	m(e, t) {
		return w(e.getMinutes(), t.length);
	},
	s(e, t) {
		return w(e.getSeconds(), t.length);
	},
	S(e, t) {
		let n = t.length, r = e.getMilliseconds();
		return w(Math.trunc(r * 10 ** (n - 3)), t.length);
	}
}, Oe = {
	am: "am",
	pm: "pm",
	midnight: "midnight",
	noon: "noon",
	morning: "morning",
	afternoon: "afternoon",
	evening: "evening",
	night: "night"
}, ke = {
	G: function(e, t, n) {
		let r = +(e.getFullYear() > 0);
		switch (t) {
			case "G":
			case "GG":
			case "GGG": return n.era(r, { width: "abbreviated" });
			case "GGGGG": return n.era(r, { width: "narrow" });
			default: return n.era(r, { width: "wide" });
		}
	},
	y: function(e, t, n) {
		if (t === "yo") {
			let t = e.getFullYear(), r = t > 0 ? t : 1 - t;
			return n.ordinalNumber(r, { unit: "year" });
		}
		return De.y(e, t);
	},
	Y: function(e, t, n, r) {
		let i = we(e, r), a = i > 0 ? i : 1 - i;
		return t === "YY" ? w(a % 100, 2) : t === "Yo" ? n.ordinalNumber(a, { unit: "year" }) : w(a, t.length);
	},
	R: function(e, t) {
		return w(ee(e), t.length);
	},
	u: function(e, t) {
		return w(e.getFullYear(), t.length);
	},
	Q: function(e, t, n) {
		let r = Math.ceil((e.getMonth() + 1) / 3);
		switch (t) {
			case "Q": return String(r);
			case "QQ": return w(r, 2);
			case "Qo": return n.ordinalNumber(r, { unit: "quarter" });
			case "QQQ": return n.quarter(r, {
				width: "abbreviated",
				context: "formatting"
			});
			case "QQQQQ": return n.quarter(r, {
				width: "narrow",
				context: "formatting"
			});
			default: return n.quarter(r, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	q: function(e, t, n) {
		let r = Math.ceil((e.getMonth() + 1) / 3);
		switch (t) {
			case "q": return String(r);
			case "qq": return w(r, 2);
			case "qo": return n.ordinalNumber(r, { unit: "quarter" });
			case "qqq": return n.quarter(r, {
				width: "abbreviated",
				context: "standalone"
			});
			case "qqqqq": return n.quarter(r, {
				width: "narrow",
				context: "standalone"
			});
			default: return n.quarter(r, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	M: function(e, t, n) {
		let r = e.getMonth();
		switch (t) {
			case "M":
			case "MM": return De.M(e, t);
			case "Mo": return n.ordinalNumber(r + 1, { unit: "month" });
			case "MMM": return n.month(r, {
				width: "abbreviated",
				context: "formatting"
			});
			case "MMMMM": return n.month(r, {
				width: "narrow",
				context: "formatting"
			});
			default: return n.month(r, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	L: function(e, t, n) {
		let r = e.getMonth();
		switch (t) {
			case "L": return String(r + 1);
			case "LL": return w(r + 1, 2);
			case "Lo": return n.ordinalNumber(r + 1, { unit: "month" });
			case "LLL": return n.month(r, {
				width: "abbreviated",
				context: "standalone"
			});
			case "LLLLL": return n.month(r, {
				width: "narrow",
				context: "standalone"
			});
			default: return n.month(r, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	w: function(e, t, n, r) {
		let i = Ee(e, r);
		return t === "wo" ? n.ordinalNumber(i, { unit: "week" }) : w(i, t.length);
	},
	I: function(e, t, n) {
		let r = Ce(e);
		return t === "Io" ? n.ordinalNumber(r, { unit: "week" }) : w(r, t.length);
	},
	d: function(e, t, n) {
		return t === "do" ? n.ordinalNumber(e.getDate(), { unit: "date" }) : De.d(e, t);
	},
	D: function(e, t, n) {
		let r = Se(e);
		return t === "Do" ? n.ordinalNumber(r, { unit: "dayOfYear" }) : w(r, t.length);
	},
	E: function(e, t, n) {
		let r = e.getDay();
		switch (t) {
			case "E":
			case "EE":
			case "EEE": return n.day(r, {
				width: "abbreviated",
				context: "formatting"
			});
			case "EEEEE": return n.day(r, {
				width: "narrow",
				context: "formatting"
			});
			case "EEEEEE": return n.day(r, {
				width: "short",
				context: "formatting"
			});
			default: return n.day(r, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	e: function(e, t, n, r) {
		let i = e.getDay(), a = (i - r.weekStartsOn + 8) % 7 || 7;
		switch (t) {
			case "e": return String(a);
			case "ee": return w(a, 2);
			case "eo": return n.ordinalNumber(a, { unit: "day" });
			case "eee": return n.day(i, {
				width: "abbreviated",
				context: "formatting"
			});
			case "eeeee": return n.day(i, {
				width: "narrow",
				context: "formatting"
			});
			case "eeeeee": return n.day(i, {
				width: "short",
				context: "formatting"
			});
			default: return n.day(i, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	c: function(e, t, n, r) {
		let i = e.getDay(), a = (i - r.weekStartsOn + 8) % 7 || 7;
		switch (t) {
			case "c": return String(a);
			case "cc": return w(a, t.length);
			case "co": return n.ordinalNumber(a, { unit: "day" });
			case "ccc": return n.day(i, {
				width: "abbreviated",
				context: "standalone"
			});
			case "ccccc": return n.day(i, {
				width: "narrow",
				context: "standalone"
			});
			case "cccccc": return n.day(i, {
				width: "short",
				context: "standalone"
			});
			default: return n.day(i, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	i: function(e, t, n) {
		let r = e.getDay(), i = r === 0 ? 7 : r;
		switch (t) {
			case "i": return String(i);
			case "ii": return w(i, t.length);
			case "io": return n.ordinalNumber(i, { unit: "day" });
			case "iii": return n.day(r, {
				width: "abbreviated",
				context: "formatting"
			});
			case "iiiii": return n.day(r, {
				width: "narrow",
				context: "formatting"
			});
			case "iiiiii": return n.day(r, {
				width: "short",
				context: "formatting"
			});
			default: return n.day(r, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	a: function(e, t, n) {
		let r = e.getHours() / 12 >= 1 ? "pm" : "am";
		switch (t) {
			case "a":
			case "aa": return n.dayPeriod(r, {
				width: "abbreviated",
				context: "formatting"
			});
			case "aaa": return n.dayPeriod(r, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "aaaaa": return n.dayPeriod(r, {
				width: "narrow",
				context: "formatting"
			});
			default: return n.dayPeriod(r, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	b: function(e, t, n) {
		let r = e.getHours(), i;
		switch (i = r === 12 ? Oe.noon : r === 0 ? Oe.midnight : r / 12 >= 1 ? "pm" : "am", t) {
			case "b":
			case "bb": return n.dayPeriod(i, {
				width: "abbreviated",
				context: "formatting"
			});
			case "bbb": return n.dayPeriod(i, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "bbbbb": return n.dayPeriod(i, {
				width: "narrow",
				context: "formatting"
			});
			default: return n.dayPeriod(i, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	B: function(e, t, n) {
		let r = e.getHours(), i;
		switch (i = r >= 17 ? Oe.evening : r >= 12 ? Oe.afternoon : r >= 4 ? Oe.morning : Oe.night, t) {
			case "B":
			case "BB":
			case "BBB": return n.dayPeriod(i, {
				width: "abbreviated",
				context: "formatting"
			});
			case "BBBBB": return n.dayPeriod(i, {
				width: "narrow",
				context: "formatting"
			});
			default: return n.dayPeriod(i, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	h: function(e, t, n) {
		if (t === "ho") {
			let t = e.getHours() % 12;
			return t === 0 && (t = 12), n.ordinalNumber(t, { unit: "hour" });
		}
		return De.h(e, t);
	},
	H: function(e, t, n) {
		return t === "Ho" ? n.ordinalNumber(e.getHours(), { unit: "hour" }) : De.H(e, t);
	},
	K: function(e, t, n) {
		let r = e.getHours() % 12;
		return t === "Ko" ? n.ordinalNumber(r, { unit: "hour" }) : w(r, t.length);
	},
	k: function(e, t, n) {
		let r = e.getHours();
		return r === 0 && (r = 24), t === "ko" ? n.ordinalNumber(r, { unit: "hour" }) : w(r, t.length);
	},
	m: function(e, t, n) {
		return t === "mo" ? n.ordinalNumber(e.getMinutes(), { unit: "minute" }) : De.m(e, t);
	},
	s: function(e, t, n) {
		return t === "so" ? n.ordinalNumber(e.getSeconds(), { unit: "second" }) : De.s(e, t);
	},
	S: function(e, t) {
		return De.S(e, t);
	},
	X: function(e, t, n) {
		let r = e.getTimezoneOffset();
		if (r === 0) return "Z";
		switch (t) {
			case "X": return je(r);
			case "XXXX":
			case "XX": return Me(r);
			default: return Me(r, ":");
		}
	},
	x: function(e, t, n) {
		let r = e.getTimezoneOffset();
		switch (t) {
			case "x": return je(r);
			case "xxxx":
			case "xx": return Me(r);
			default: return Me(r, ":");
		}
	},
	O: function(e, t, n) {
		let r = e.getTimezoneOffset();
		switch (t) {
			case "O":
			case "OO":
			case "OOO": return "GMT" + Ae(r, ":");
			default: return "GMT" + Me(r, ":");
		}
	},
	z: function(e, t, n) {
		let r = e.getTimezoneOffset();
		switch (t) {
			case "z":
			case "zz":
			case "zzz": return "GMT" + Ae(r, ":");
			default: return "GMT" + Me(r, ":");
		}
	},
	t: function(e, t, n) {
		return w(Math.trunc(e / 1e3), t.length);
	},
	T: function(e, t, n) {
		return w(+e, t.length);
	}
};
function Ae(e, t = "") {
	let n = e > 0 ? "-" : "+", r = Math.abs(e), i = Math.trunc(r / 60), a = r % 60;
	return a === 0 ? n + String(i) : n + String(i) + t + w(a, 2);
}
function je(e, t) {
	return e % 60 == 0 ? (e > 0 ? "-" : "+") + w(Math.abs(e) / 60, 2) : Me(e, t);
}
function Me(e, t = "") {
	let n = e > 0 ? "-" : "+", r = Math.abs(e), i = w(Math.trunc(r / 60), 2), a = w(r % 60, 2);
	return n + i + t + a;
}
// node_modules/date-fns/_lib/format/longFormatters.js
var Ne = (e, t) => {
	switch (e) {
		case "P": return t.date({ width: "short" });
		case "PP": return t.date({ width: "medium" });
		case "PPP": return t.date({ width: "long" });
		default: return t.date({ width: "full" });
	}
}, Pe = (e, t) => {
	switch (e) {
		case "p": return t.time({ width: "short" });
		case "pp": return t.time({ width: "medium" });
		case "ppp": return t.time({ width: "long" });
		default: return t.time({ width: "full" });
	}
}, Fe = {
	p: Pe,
	P: (e, t) => {
		let n = e.match(/(P+)(p+)?/) || [], r = n[1], i = n[2];
		if (!i) return Ne(e, t);
		let a;
		switch (r) {
			case "P":
				a = t.dateTime({ width: "short" });
				break;
			case "PP":
				a = t.dateTime({ width: "medium" });
				break;
			case "PPP":
				a = t.dateTime({ width: "long" });
				break;
			default: a = t.dateTime({ width: "full" });
		}
		return a.replace("{{date}}", Ne(r, t)).replace("{{time}}", Pe(i, t));
	}
}, Ie = /^D+$/, Le = /^Y+$/, Re = [
	"D",
	"DD",
	"YY",
	"YYYY"
];
function ze(e) {
	return Ie.test(e);
}
function Be(e) {
	return Le.test(e);
}
function Ve(e, t, n) {
	let r = He(e, t, n);
	if (console.warn(r), Re.includes(e)) throw RangeError(r);
}
function He(e, t, n) {
	let r = e[0] === "Y" ? "years" : "days of the month";
	return `Use \`${e.toLowerCase()}\` instead of \`${e}\` (in \`${t}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
// node_modules/date-fns/format.js
var Ue = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, We = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, Ge = /^'([^]*?)'?$/, Ke = /''/g, qe = /[a-zA-Z]/;
function Je(e, t, n) {
	let r = v(), i = n?.locale ?? r.locale ?? xe, a = n?.firstWeekContainsDate ?? n?.locale?.options?.firstWeekContainsDate ?? r.firstWeekContainsDate ?? r.locale?.options?.firstWeekContainsDate ?? 1, o = n?.weekStartsOn ?? n?.locale?.options?.weekStartsOn ?? r.weekStartsOn ?? r.locale?.options?.weekStartsOn ?? 0, s = m(e, n?.in);
	if (!oe(s)) throw RangeError("Invalid time value");
	let c = t.match(We).map((e) => {
		let t = e[0];
		if (t === "p" || t === "P") {
			let n = Fe[t];
			return n(e, i.formatLong);
		}
		return e;
	}).join("").match(Ue).map((e) => {
		if (e === "''") return {
			isToken: !1,
			value: "'"
		};
		let t = e[0];
		if (t === "'") return {
			isToken: !1,
			value: Ye(e)
		};
		if (ke[t]) return {
			isToken: !0,
			value: e
		};
		if (t.match(qe)) throw RangeError("Format string contains an unescaped latin alphabet character `" + t + "`");
		return {
			isToken: !1,
			value: e
		};
	});
	i.localize.preprocessor && (c = i.localize.preprocessor(s, c));
	let l = {
		firstWeekContainsDate: a,
		weekStartsOn: o,
		locale: i
	};
	return c.map((r) => {
		if (!r.isToken) return r.value;
		let a = r.value;
		(!n?.useAdditionalWeekYearTokens && Be(a) || !n?.useAdditionalDayOfYearTokens && ze(a)) && Ve(a, t, String(e));
		let o = ke[a[0]];
		return o(s, a, i.localize, l);
	}).join("");
}
function Ye(e) {
	let t = e.match(Ge);
	return t ? t[1].replace(Ke, "'") : e;
}
// node_modules/date-fns/parseISO.js
function Xe(e, t) {
	let n = () => p(t?.in, NaN), r = t?.additionalDigits ?? 2, i = tt(e), a;
	if (i.date) {
		let e = nt(i.date, r);
		a = rt(e.restDateString, e.year);
	}
	if (!a || isNaN(+a)) return n();
	let o = +a, s = 0, c;
	if (i.time && (s = at(i.time), isNaN(s))) return n();
	if (i.timezone) {
		if (c = st(i.timezone), isNaN(c)) return n();
	} else {
		let e = new Date(o + s), n = m(0, t?.in);
		return n.setFullYear(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()), n.setHours(e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds(), e.getUTCMilliseconds()), n;
	}
	return m(o + s + c, t?.in);
}
var Ze = {
	dateTimeDelimiter: /[T ]/,
	timeZoneDelimiter: /[Z ]/i,
	timezone: /([Z+-].*)$/
}, Qe = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/, $e = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/, et = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function tt(e) {
	let t = {}, n = e.split(Ze.dateTimeDelimiter), r;
	if (n.length > 2) return t;
	if (/:/.test(n[0]) ? r = n[0] : (t.date = n[0], r = n[1], Ze.timeZoneDelimiter.test(t.date) && (t.date = e.split(Ze.timeZoneDelimiter)[0], r = e.substr(t.date.length, e.length))), r) {
		let e = Ze.timezone.exec(r);
		e ? (t.time = r.replace(e[1], ""), t.timezone = e[1]) : t.time = r;
	}
	return t;
}
function nt(e, t) {
	let n = RegExp("^(?:(\\d{4}|[+-]\\d{" + (4 + t) + "})|(\\d{2}|[+-]\\d{" + (2 + t) + "})$)"), r = e.match(n);
	if (!r) return {
		year: NaN,
		restDateString: ""
	};
	let i = r[1] ? parseInt(r[1]) : null, a = r[2] ? parseInt(r[2]) : null;
	return {
		year: a === null ? i : a * 100,
		restDateString: e.slice((r[1] || r[2]).length)
	};
}
function rt(e, t) {
	if (t === null) return /* @__PURE__ */ new Date(NaN);
	let n = e.match(Qe);
	if (!n) return /* @__PURE__ */ new Date(NaN);
	let r = !!n[4], i = it(n[1]), a = it(n[2]) - 1, o = it(n[3]), s = it(n[4]), c = it(n[5]) - 1;
	if (r) return pt(t, s, c) ? ct(t, s, c) : /* @__PURE__ */ new Date(NaN);
	{
		let e = /* @__PURE__ */ new Date(0);
		return !dt(t, a, o) || !ft(t, i) ? /* @__PURE__ */ new Date(NaN) : (e.setUTCFullYear(t, a, Math.max(i, o)), e);
	}
}
function it(e) {
	return e ? parseInt(e) : 1;
}
function at(e) {
	let t = e.match($e);
	if (!t) return NaN;
	let n = ot(t[1]), r = ot(t[2]), i = ot(t[3]);
	return mt(n, r, i) ? n * d + r * u + i * 1e3 : NaN;
}
function ot(e) {
	return e && parseFloat(e.replace(",", ".")) || 0;
}
function st(e) {
	if (e === "Z") return 0;
	let t = e.match(et);
	if (!t) return 0;
	let n = t[1] === "+" ? -1 : 1, r = parseInt(t[2]), i = t[3] && parseInt(t[3]) || 0;
	return ht(r, i) ? n * (r * d + i * u) : NaN;
}
function ct(e, t, n) {
	let r = /* @__PURE__ */ new Date(0);
	r.setUTCFullYear(e, 0, 4);
	let i = r.getUTCDay() || 7, a = (t - 1) * 7 + n + 1 - i;
	return r.setUTCDate(r.getUTCDate() + a), r;
}
var lt = [
	31,
	null,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
function ut(e) {
	return e % 400 == 0 || e % 4 == 0 && e % 100 != 0;
}
function dt(e, t, n) {
	return t >= 0 && t <= 11 && n >= 1 && n <= (lt[t] || (ut(e) ? 29 : 28));
}
function ft(e, t) {
	return t >= 1 && t <= (ut(e) ? 366 : 365);
}
function pt(e, t, n) {
	return t >= 1 && t <= 53 && n >= 0 && n <= 6;
}
function mt(e, t, n) {
	return e === 24 ? t === 0 && n === 0 : n >= 0 && n < 60 && t >= 0 && t < 60 && e >= 0 && e < 25;
}
function ht(e, t) {
	return t >= 0 && t <= 59;
}
// src/types.ts
var T = n(), gt = s(), _t = [
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
	"sun"
], vt = (e) => Je(e, "yyyy-MM-dd"), yt = (e, t) => vt(h(Xe(e), t)), bt = (e, t) => vt(g(Xe(e), t)), xt = (e) => vt(y(Xe(e), { weekStartsOn: 1 })), St = (e) => _t[(Xe(e).getDay() + 6) % 7], Ct = (e) => {
	let t = xt(e);
	return _t.map((e, n) => yt(t, n));
}, wt = (e) => {
	let t = Xe(e), n = xt(vt(le(t))), r = re(Xe(yt(xt(vt(ce(t))), 6)), Xe(n)) + 1;
	return Array.from({ length: r }, (e, t) => yt(n, t));
}, Tt = (e, t) => e.slice(0, 7) === t.slice(0, 7), E = (e, t) => Je(Xe(e), t), Et = (e, t = /* @__PURE__ */ new Date()) => {
	let n = new Intl.DateTimeFormat("en-US", {
		timeZone: e,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = (e) => n.find((t) => t.type === e)?.value ?? "";
	return `${r("year")}-${r("month")}-${r("day")}`;
}, Dt = (e) => e.slice(11, 16), Ot = (e, t) => e.slice(0, 10) !== t.slice(0, 10), D = (e, t) => t <= e, kt = "roster_planner/", At = class {
	connection;
	entryId;
	constructor(e, t) {
		this.connection = e, this.entryId = t;
	}
	static list(e) {
		return e.sendMessagePromise({ type: `${kt}list` });
	}
	send(e, t = {}) {
		return this.connection.sendMessagePromise({
			type: `${kt}${e}`,
			entry_id: this.entryId,
			...t
		});
	}
	subscribe(e) {
		return this.connection.subscribeMessage(e, {
			type: `${kt}subscribe`,
			entry_id: this.entryId
		});
	}
	resolve(e, t) {
		return this.send("resolve", {
			start: e,
			end: t
		});
	}
	preview(e, t, n, r) {
		return this.send("preview", {
			start: n,
			end: r,
			[e]: t
		});
	}
	create(e, t) {
		return this.send(`${e}/create`, { item: t });
	}
	update(e, t, n) {
		return this.send(`${e}/update`, {
			item_id: t,
			item: n
		});
	}
	remove(e, t, n) {
		return this.send(`${e}/delete`, {
			item_id: t,
			...n ? { replace_with: n } : {}
		});
	}
	setException(e, t, n) {
		return this.send("exception/set", {
			date: e,
			assignment: t,
			note: n || null
		});
	}
	clearException(e) {
		return this.send("exception/clear", { date: e });
	}
	exportData() {
		return this.send("export");
	}
	importData(e) {
		return this.send("import", { data: e });
	}
}, jt = (0, T.createContext)(null), Mt = () => {
	let e = (0, T.useContext)(jt);
	if (!e) throw Error("Panel rendered without hass");
	return e;
}, Nt = (0, T.createContext)(null), O = () => {
	let e = (0, T.useContext)(Nt);
	if (!e) throw Error("No roster selected");
	return e;
}, Pt = () => {
	let { connection: e } = Mt(), [t, n] = (0, T.useState)(null), [r, i] = (0, T.useState)(null);
	return (0, T.useEffect)(() => {
		let t = !0;
		return At.list(e).then((e) => t && n(e), (e) => t && i(e)), () => {
			t = !1;
		};
	}, [e]), {
		rosters: t,
		error: r
	};
}, Ft = (e) => {
	let { connection: t } = Mt(), [n, r] = (0, T.useState)(null), [i, a] = (0, T.useState)(null), o = (0, T.useMemo)(() => e ? new At(t, e) : null, [t, e]);
	return (0, T.useEffect)(() => {
		if (!o) return;
		let e = !0, t;
		return o.subscribe((t) => e && r(t)).then((n) => {
			e ? t = n : n();
		}, (t) => e && a(t)), () => {
			e = !1, r(null), a(null), t?.();
		};
	}, [o]), {
		api: o,
		config: n,
		error: i
	};
}, It = (e = 3e4) => {
	let [t, n] = (0, T.useState)(() => Date.now());
	return (0, T.useEffect)(() => {
		let t = setInterval(() => n(Date.now()), e);
		return () => clearInterval(t);
	}, [e]), t;
}, Lt = (e, t) => {
	let { api: n, config: r } = O(), [i, a] = (0, T.useState)(null);
	return (0, T.useEffect)(() => {
		let r = !0;
		return n.resolve(e, t).then((e) => r && a(e), () => void 0), () => {
			r = !1;
		};
	}, [
		n,
		r,
		e,
		t
	]), i;
}, Rt = () => {
	let [e, t] = (0, T.useState)(null), [n, r] = (0, T.useState)(!1);
	return {
		error: e,
		busy: n,
		submit: async (e) => {
			r(!0), t(null);
			try {
				return await e(), !0;
			} catch (e) {
				return t(e), !1;
			} finally {
				r(!1);
			}
		},
		setError: t
	};
}, zt = (e) => {
	let t = Ot(e.start, e.end) ? " (+1)" : "";
	return `${Dt(e.start)}–${Dt(e.end)}${t}`;
}, Bt = (e) => e.shift?.flag === "extra" ? "extra" : e.exception && (e.shift || e.base) ? "changed" : null, Vt = (e, t) => {
	let n = Dt(e.start), r = Dt(e.end), i = t.find((t) => t.name === e.title && t.start === n && t.end === r);
	return i ? {
		type: "shift",
		shift_type_id: i.id
	} : {
		type: "custom",
		start: n,
		end: r,
		label: e.title
	};
}, Ht = (e) => ({
	change: e.shift !== null,
	extra: e.shift === null,
	off: e.shift !== null,
	reset: e.exception !== null
}), Ut = (e) => {
	let { shift: t, base: n } = e;
	return t ? t.source === "exception" ? t.flag === "extra" ? "Extra shift" : n ? `Changed · usually ${zt(n)}` : "Changed" : t.source === "variation" ? `From ${t.source_name}` : `From ${t.source_name} · Week ${t.week}` : e.exception && n ? `Cancelled · usually ${zt(n)}` : "";
}, Wt = (e, t) => {
	for (let n of e) if (n.shift && new Date(n.shift.end).getTime() > t) return n.shift;
	return null;
}, Gt = (e, t) => e ? new Date(e.start).getTime() <= t ? `On shift until ${Dt(e.end)}` : `Next shift: ${E(e.date, "EEE")} ${zt(e)}` : "No upcoming shifts", Kt = {
	mon: "Monday",
	tue: "Tuesday",
	wed: "Wednesday",
	thu: "Thursday",
	fri: "Friday",
	sat: "Saturday",
	sun: "Sunday"
}, qt = (e) => Kt[e], Jt = (e, t) => {
	if (!e || e.type === "off") return "Off";
	if (e.type === "custom") {
		let t = D(e.start, e.end) ? " (+1)" : "";
		return `${e.label ?? "Custom"} ${e.start}–${e.end}${t}`;
	}
	return t.find((t) => t.id === e.shift_type_id)?.name ?? "Unknown";
}, Yt = (e, t) => Array.from({ length: t }, (t, n) => e[n] ?? null), Xt = (e) => [...e].sort((e, t) => e.priority - t.priority), Zt = (e, t, n) => {
	let r = Xt(e), i = r.findIndex((e) => e.id === t), a = i + n;
	return i < 0 || a < 0 || a >= r.length ? [] : ([r[i], r[a]] = [r[a], r[i]], r.map((e, t) => ({
		id: e.id,
		priority: t,
		was: e.priority
	})).filter((e) => e.priority !== e.was).map(({ id: e, priority: t }) => ({
		id: e,
		priority: t
	})));
}, Qt = (e, t) => yt(e, (_t.indexOf(t) - _t.indexOf(St(e)) + 7) % 7), k = (e, t, n, r) => {
	let i = `Every ${e === 1 ? "week" : `${e} weeks`}: ${qt(t)} ${n.name}`;
	return {
		pattern: {
			name: i,
			days: { [t]: {
				type: "shift",
				shift_type_id: n.id
			} }
		},
		rotation: (n) => ({
			name: i,
			anchor: xt(Qt(r, t)),
			cycle_weeks: e,
			slots: Yt([n], e),
			active_from: r
		})
	};
}, $t = (e, t) => {
	let n = [...e].sort((e, t) => e.start_date.localeCompare(t.start_date));
	return {
		active: n.filter((e) => e.start_date <= t && t <= e.end_date),
		upcoming: n.filter((e) => e.start_date > t),
		past: n.filter((e) => e.end_date < t).reverse()
	};
}, en = (e, t) => {
	let n = [...e].sort((e, t) => e.date.localeCompare(t.date));
	return {
		upcoming: n.filter((e) => e.date >= t),
		past: n.filter((e) => e.date < t).reverse()
	};
}, tn = /* @__PURE__ */ e(((e) => {
	var t = n(), r = Symbol.for("react.element"), i = Symbol.for("react.fragment"), a = Object.prototype.hasOwnProperty, o = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, s = {
		key: !0,
		ref: !0,
		__self: !0,
		__source: !0
	};
	function c(e, t, n) {
		var i, c = {}, l = null, u = null;
		for (i in n !== void 0 && (l = "" + n), t.key !== void 0 && (l = "" + t.key), t.ref !== void 0 && (u = t.ref), t) a.call(t, i) && !s.hasOwnProperty(i) && (c[i] = t[i]);
		if (e && e.defaultProps) for (i in t = e.defaultProps, t) c[i] === void 0 && (c[i] = t[i]);
		return {
			$$typeof: r,
			type: e,
			key: l,
			ref: u,
			props: c,
			_owner: o.current
		};
	}
	e.Fragment = i, e.jsx = c, e.jsxs = c;
})), A = (/* @__PURE__ */ e(((e, t) => {
	t.exports = tn();
})))(), nn = 60, rn = ({ onPrevious: e, onNext: t, children: n }) => {
	let r = (0, T.useRef)(null);
	return /* @__PURE__ */ (0, A.jsx)("div", {
		onTouchStart: (e) => {
			let t = e.touches[0];
			r.current = {
				x: t.clientX,
				y: t.clientY
			};
		},
		onTouchEnd: (n) => {
			if (!r.current) return;
			let i = n.changedTouches[0], a = i.clientX - r.current.x, o = i.clientY - r.current.y;
			r.current = null, Math.abs(a) < nn || Math.abs(a) < Math.abs(o) * 2 || (a > 0 ? e() : t());
		},
		children: n
	});
}, an = ({ day: e }) => {
	let t = Bt(e);
	return t === "extra" ? /* @__PURE__ */ (0, A.jsx)("span", {
		className: "marker plus",
		children: "+"
	}) : t === "changed" ? /* @__PURE__ */ (0, A.jsx)("span", { className: "marker dot" }) : null;
}, on = ({ anchor: e, today: t, days: n, onSelect: r }) => /* @__PURE__ */ (0, A.jsx)("div", {
	className: "week",
	children: Ct(e).map((e) => {
		let i = n.get(e), a = [
			"week-row",
			e === t ? "today" : "",
			i?.variation_id ? "in-variation" : ""
		];
		return /* @__PURE__ */ (0, A.jsxs)("button", {
			type: "button",
			className: a.join(" "),
			disabled: !i,
			onClick: () => i && r(i),
			children: [
				/* @__PURE__ */ (0, A.jsxs)("span", {
					className: "week-date",
					children: [/* @__PURE__ */ (0, A.jsx)("span", {
						className: "muted",
						children: E(e, "EEE")
					}), /* @__PURE__ */ (0, A.jsx)("strong", { children: E(e, "d") })]
				}),
				i?.shift ? /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [/* @__PURE__ */ (0, A.jsx)("span", {
					className: "colour-bar",
					style: { background: i.shift.colour }
				}), /* @__PURE__ */ (0, A.jsxs)("span", {
					className: "week-shift",
					children: [/* @__PURE__ */ (0, A.jsx)("strong", { children: zt(i.shift) }), /* @__PURE__ */ (0, A.jsx)("span", {
						className: "muted",
						children: i.shift.title
					})]
				})] }) : /* @__PURE__ */ (0, A.jsx)("span", {
					className: "week-shift muted",
					children: i ? "Off" : ""
				}),
				i && /* @__PURE__ */ (0, A.jsx)(an, { day: i })
			]
		}, e);
	})
}), sn = ({ anchor: e, today: t, days: n, onSelect: r, narrow: i }) => /* @__PURE__ */ (0, A.jsxs)("div", {
	className: "month",
	children: [Ct(e).map((e) => /* @__PURE__ */ (0, A.jsx)("span", {
		className: "month-heading muted",
		children: E(e, "EEEEE")
	}, e)), wt(e).map((a) => {
		let o = n.get(a), s = [
			"month-cell",
			a === t ? "today" : "",
			Tt(a, e) ? "" : "outside",
			o?.variation_id ? "in-variation" : ""
		];
		return /* @__PURE__ */ (0, A.jsxs)("button", {
			type: "button",
			className: s.join(" "),
			disabled: !o,
			"aria-label": E(a, "EEEE d MMMM") + (o?.shift ? `, ${zt(o.shift)} ${o.shift.title}` : ""),
			onClick: () => o && r(o),
			children: [/* @__PURE__ */ (0, A.jsxs)("span", {
				className: "month-number",
				children: [E(a, "d"), o && /* @__PURE__ */ (0, A.jsx)(an, { day: o })]
			}), o?.shift && (i ? /* @__PURE__ */ (0, A.jsx)("span", {
				className: "month-dot",
				style: { background: o.shift.colour }
			}) : /* @__PURE__ */ (0, A.jsx)("span", {
				className: "month-time",
				style: { borderColor: o.shift.colour },
				children: Dt(o.shift.start)
			}))]
		}, a);
	})]
}), cn = "__custom", ln = "__off", un = (e) => e.type === "off" ? ln : e.type === "custom" ? cn : e.shift_type_id, dn = ({ value: e, shiftTypes: t, onChange: n, allowOff: r = !0 }) => {
	let i = (e) => {
		n(e === ln ? { type: "off" } : e === cn ? {
			type: "custom",
			start: "09:00",
			end: "17:00"
		} : {
			type: "shift",
			shift_type_id: e
		});
	};
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "assignment",
		children: [/* @__PURE__ */ (0, A.jsxs)("select", {
			value: un(e),
			onChange: (e) => i(e.target.value),
			children: [
				r && /* @__PURE__ */ (0, A.jsx)("option", {
					value: ln,
					children: "Off"
				}),
				t.map((e) => /* @__PURE__ */ (0, A.jsxs)("option", {
					value: e.id,
					children: [
						e.name,
						" (",
						e.start,
						"–",
						e.end,
						")"
					]
				}, e.id)),
				/* @__PURE__ */ (0, A.jsx)("option", {
					value: cn,
					children: "Custom times"
				})
			]
		}), e.type === "custom" && /* @__PURE__ */ (0, A.jsxs)("div", {
			className: "assignment-times",
			children: [
				/* @__PURE__ */ (0, A.jsx)("input", {
					type: "time",
					"aria-label": "Start",
					value: e.start,
					onChange: (t) => n({
						...e,
						start: t.target.value
					})
				}),
				/* @__PURE__ */ (0, A.jsx)("input", {
					type: "time",
					"aria-label": "End",
					value: e.end,
					onChange: (t) => n({
						...e,
						end: t.target.value
					})
				}),
				e.end < e.start && /* @__PURE__ */ (0, A.jsx)("span", {
					className: "muted",
					children: "(+1)"
				})
			]
		})]
	});
}, j = {
	menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
	back: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
	left: "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",
	right: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
	gear: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
	up: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
	down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
}, fn = ({ path: e }) => /* @__PURE__ */ (0, A.jsx)("svg", {
	viewBox: "0 0 24 24",
	width: "24",
	height: "24",
	"aria-hidden": "true",
	children: /* @__PURE__ */ (0, A.jsx)("path", {
		d: e,
		fill: "currentColor"
	})
}), pn = ({ path: e, label: t, onClick: n, disabled: r }) => /* @__PURE__ */ (0, A.jsx)("button", {
	type: "button",
	className: "icon-button",
	"aria-label": t,
	title: t,
	onClick: n,
	disabled: r,
	children: /* @__PURE__ */ (0, A.jsx)(fn, { path: e })
}), mn = ({ title: e, onClose: t, children: n }) => ((0, T.useEffect)(() => {
	let e = (e) => {
		e.key === "Escape" && t();
	};
	return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
}, [t]), /* @__PURE__ */ (0, A.jsx)("div", {
	className: "sheet-backdrop",
	onClick: t,
	children: /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "sheet",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": e,
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, A.jsx)("h2", { children: e }), n]
	})
})), hn = ({ title: e, message: t, action: n, onConfirm: r, onCancel: i }) => /* @__PURE__ */ (0, A.jsxs)(mn, {
	title: e,
	onClose: i,
	children: [t && /* @__PURE__ */ (0, A.jsx)("p", {
		className: "muted",
		children: t
	}), /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "actions",
		children: [/* @__PURE__ */ (0, A.jsx)("button", {
			type: "button",
			className: "button danger",
			onClick: r,
			children: n
		}), /* @__PURE__ */ (0, A.jsx)("button", {
			type: "button",
			className: "button",
			onClick: i,
			children: "Cancel"
		})]
	})]
}), M = ({ error: e, field: t }) => e?.field === t ? /* @__PURE__ */ (0, A.jsx)("p", {
	className: "error",
	children: e.message
}) : null, gn = ({ error: e, fields: t = [] }) => e && !t.includes(e.field ?? "") ? /* @__PURE__ */ (0, A.jsx)("p", {
	className: "error",
	children: e.message
}) : null, N = ({ label: e, children: t }) => /* @__PURE__ */ (0, A.jsxs)("label", {
	className: "field",
	children: [/* @__PURE__ */ (0, A.jsx)("span", { children: e }), t]
}), _n = (e, t) => {
	let n = e.exception?.assignment;
	return n && n.type !== "off" ? n : e.shift ? Vt(e.shift, t) : t[0] ? {
		type: "shift",
		shift_type_id: t[0].id
	} : {
		type: "custom",
		start: "09:00",
		end: "17:00"
	};
}, vn = ({ day: e, onClose: t }) => {
	let { api: n, config: r, canEdit: i } = O(), { error: a, busy: o, submit: s } = Rt(), [c, l] = (0, T.useState)(!1), [u, d] = (0, T.useState)(e.exception?.note ?? ""), [f, p] = (0, T.useState)(() => _n(e, r.shift_types)), m = Ht(e), h = Ut(e), g = async (e) => {
		await s(e) && t();
	};
	return /* @__PURE__ */ (0, A.jsxs)(mn, {
		title: E(e.date, "EEEE d MMMM"),
		onClose: t,
		children: [
			e.shift ? /* @__PURE__ */ (0, A.jsxs)("p", {
				className: "sheet-shift",
				children: [
					/* @__PURE__ */ (0, A.jsx)("span", {
						className: "colour-bar",
						style: { background: e.shift.colour }
					}),
					/* @__PURE__ */ (0, A.jsx)("strong", { children: zt(e.shift) }),
					" ",
					e.shift.title
				]
			}) : /* @__PURE__ */ (0, A.jsx)("p", {
				className: "sheet-shift muted",
				children: "Off"
			}),
			h && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "muted",
				children: h
			}),
			e.exception?.note && !i && /* @__PURE__ */ (0, A.jsx)("p", { children: e.exception.note }),
			e.overlaps_previous && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "warning",
				children: "Overlaps the previous day's shift."
			}),
			i && c && /* @__PURE__ */ (0, A.jsx)(dn, {
				value: f,
				shiftTypes: r.shift_types,
				onChange: p,
				allowOff: !1
			}),
			i && /* @__PURE__ */ (0, A.jsx)(N, {
				label: "Note",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: u,
					onChange: (e) => d(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, { error: a }),
			i && /* @__PURE__ */ (0, A.jsx)("div", {
				className: "actions",
				children: c ? /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: o,
					onClick: () => g(() => n.setException(e.date, f, u)),
					children: "Save"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: () => l(!1),
					children: "Cancel"
				})] }) : /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
					m.change && /* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button",
						onClick: () => l(!0),
						children: "Change this day"
					}),
					m.extra && /* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button",
						onClick: () => l(!0),
						children: "Add extra shift"
					}),
					m.off && /* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button",
						disabled: o,
						onClick: () => g(() => n.setException(e.date, { type: "off" }, u)),
						children: "Day off"
					}),
					m.reset && /* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button",
						disabled: o,
						onClick: () => g(() => n.clearException(e.date)),
						children: "Reset to roster"
					})
				] })
			}),
			!c && /* @__PURE__ */ (0, A.jsx)("button", {
				type: "button",
				className: "button",
				onClick: t,
				children: "Close"
			})
		]
	});
}, yn = 60, bn = ({ narrow: e }) => {
	let { today: t } = O(), [n, r] = (0, T.useState)(e ? "week" : "month"), [i, a] = (0, T.useState)(t), [o, s] = (0, T.useState)(null), c = n === "week" ? Ct(i) : wt(i), l = Lt(c[0], c[c.length - 1]), u = Lt(yt(t, -1), yt(t, yn)), d = (0, T.useMemo)(() => new Map((l ?? []).map((e) => [e.date, e])), [l]), f = (e) => a((t) => n === "week" ? yt(t, e * 7) : bt(t, e)), p = It(), m = o ? d.get(o) : void 0, h = n === "week" ? `${E(c[0], "d MMM")} – ${E(c[6], "d MMM")}` : E(i, "MMMM yyyy"), g = (e) => s(e.date);
	return /* @__PURE__ */ (0, A.jsxs)("main", {
		className: "content",
		children: [
			u && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "summary",
				children: Gt(Wt(u, p), p)
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "toolbar",
				children: [
					/* @__PURE__ */ (0, A.jsx)(pn, {
						path: j.left,
						label: "Previous",
						onClick: () => f(-1)
					}),
					/* @__PURE__ */ (0, A.jsx)("strong", {
						className: "toolbar-title",
						children: h
					}),
					/* @__PURE__ */ (0, A.jsx)(pn, {
						path: j.right,
						label: "Next",
						onClick: () => f(1)
					}),
					/* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button small",
						onClick: () => a(t),
						children: "Today"
					}),
					/* @__PURE__ */ (0, A.jsx)("div", {
						className: "segmented",
						children: ["week", "month"].map((e) => /* @__PURE__ */ (0, A.jsx)("button", {
							type: "button",
							className: n === e ? "selected" : "",
							onClick: () => r(e),
							children: e === "week" ? "Week" : "Month"
						}, e))
					})
				]
			}),
			/* @__PURE__ */ (0, A.jsx)(rn, {
				onPrevious: () => f(-1),
				onNext: () => f(1),
				children: n === "week" ? /* @__PURE__ */ (0, A.jsx)(on, {
					anchor: i,
					today: t,
					days: d,
					onSelect: g
				}) : /* @__PURE__ */ (0, A.jsx)(sn, {
					anchor: i,
					today: t,
					days: d,
					onSelect: g,
					narrow: e
				})
			}),
			m && /* @__PURE__ */ (0, A.jsx)(vn, {
				day: m,
				onClose: () => s(null)
			}, m.date)
		]
	});
}, xn = () => {
	let { api: e, canEdit: t, today: n } = O(), { error: r, busy: i, submit: a, setError: o } = Rt(), [s, c] = (0, T.useState)(null), [l, u] = (0, T.useState)(null), [d, f] = (0, T.useState)(!1);
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsx)("button", {
				type: "button",
				className: "button",
				disabled: i,
				onClick: () => a(async () => {
					let t = JSON.stringify(await e.exportData(), null, 2);
					c(t);
					let r = document.createElement("a");
					r.href = URL.createObjectURL(new Blob([t], { type: "application/json" })), r.download = `roster-${n}.json`, r.click(), setTimeout(() => URL.revokeObjectURL(r.href), 1e4);
				}),
				children: "Export JSON"
			}),
			s && /* @__PURE__ */ (0, A.jsx)("textarea", {
				className: "export",
				"aria-label": "Exported JSON",
				readOnly: !0,
				rows: 8,
				value: s
			}),
			t && /* @__PURE__ */ (0, A.jsxs)("label", {
				className: "button file-button",
				children: ["Import JSON", /* @__PURE__ */ (0, A.jsx)("input", {
					type: "file",
					accept: "application/json,.json",
					onChange: async (e) => {
						let t = e.target.files?.[0];
						if (e.target.value = "", t) {
							f(!1);
							try {
								let e = JSON.parse(await t.text());
								if (typeof e != "object" || !e) throw Error();
								u(e), o(null);
							} catch {
								o({
									code: "invalid_json",
									message: "That file is not a roster backup"
								});
							}
						}
					}
				})]
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, { error: r }),
			d && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "muted",
				children: "Roster restored."
			}),
			l !== null && /* @__PURE__ */ (0, A.jsx)(hn, {
				title: "Replace this roster?",
				message: "Everything in this roster will be replaced by the file's contents.",
				action: "Replace",
				onConfirm: async () => {
					let t = l;
					u(null), f(await a(() => e.importData(t)));
				},
				onCancel: () => u(null)
			})
		]
	});
}, Sn = ({ item: e, onRemove: t }) => {
	let { config: n } = O();
	return /* @__PURE__ */ (0, A.jsxs)("li", { children: [/* @__PURE__ */ (0, A.jsx)("span", {
		className: "list-main",
		children: /* @__PURE__ */ (0, A.jsxs)("span", { children: [E(e.date, "EEE d MMM yyyy"), /* @__PURE__ */ (0, A.jsxs)("span", {
			className: "muted list-detail",
			children: [Jt(e.assignment, n.shift_types), e.note ? ` · ${e.note}` : ""]
		})] })
	}), /* @__PURE__ */ (0, A.jsx)("button", {
		type: "button",
		className: "button small danger",
		onClick: () => t(e),
		children: "Remove"
	})] });
}, Cn = () => {
	let { api: e, config: t, today: n } = O(), { error: r, submit: i } = Rt(), [a, o] = (0, T.useState)(null), [s, c] = (0, T.useState)(!1), { upcoming: l, past: u } = en(t.exceptions, n);
	return /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
		/* @__PURE__ */ (0, A.jsx)(gn, { error: r }),
		l.length === 0 && u.length === 0 && /* @__PURE__ */ (0, A.jsx)("p", {
			className: "muted",
			children: "No one-off changes."
		}),
		/* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list",
			children: l.map((e) => /* @__PURE__ */ (0, A.jsx)(Sn, {
				item: e,
				onRemove: o
			}, e.date))
		}),
		u.length > 0 && /* @__PURE__ */ (0, A.jsx)("button", {
			type: "button",
			className: "button small",
			onClick: () => c(!s),
			children: s ? "Hide past" : `Show past (${u.length})`
		}),
		s && /* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list past",
			children: u.map((e) => /* @__PURE__ */ (0, A.jsx)(Sn, {
				item: e,
				onRemove: o
			}, e.date))
		}),
		a && /* @__PURE__ */ (0, A.jsx)(hn, {
			title: `Remove the change on ${E(a.date, "d MMM")}?`,
			message: "This date will follow the roster again.",
			action: "Remove",
			onConfirm: async () => {
				if (!a) return;
				let t = a.date;
				o(null), await i(() => e.clearException(t));
			},
			onCancel: () => o(null)
		})
	] });
}, wn = ({ kind: e, item: t, replacements: n = [], onClose: r }) => {
	let { api: i } = O(), { error: a, busy: o, submit: s } = Rt(), [c, l] = (0, T.useState)(n[0]?.id ?? ""), u = a?.code === "in_use", d = async (n) => {
		await s(() => i.remove(e, t.id, n)) && r();
	};
	return /* @__PURE__ */ (0, A.jsxs)(mn, {
		title: `Delete ${t.name}?`,
		onClose: r,
		children: [
			/* @__PURE__ */ (0, A.jsx)(gn, { error: a }),
			u && n.length > 0 && /* @__PURE__ */ (0, A.jsx)("select", {
				"aria-label": "Replace with",
				value: c,
				onChange: (e) => l(e.target.value),
				children: n.map((e) => /* @__PURE__ */ (0, A.jsxs)("option", {
					value: e.id,
					children: ["Replace with ", e.name]
				}, e.id))
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [u ? n.length > 0 && /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button danger",
					disabled: o,
					onClick: () => d(c),
					children: "Replace and delete"
				}) : /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button danger",
					disabled: o,
					onClick: () => d(),
					children: "Delete"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: r,
					children: "Cancel"
				})]
			})
		]
	});
}, Tn = { type: "off" }, En = ({ days: e, onChange: t }) => {
	let { config: n } = O();
	return /* @__PURE__ */ (0, A.jsx)("div", {
		className: "days",
		children: _t.map((r) => /* @__PURE__ */ (0, A.jsxs)("div", {
			className: "days-row",
			children: [/* @__PURE__ */ (0, A.jsx)("span", { children: qt(r).slice(0, 3) }), /* @__PURE__ */ (0, A.jsx)(dn, {
				value: e[r] ?? Tn,
				shiftTypes: n.shift_types,
				onChange: (n) => t({
					...e,
					[r]: n
				})
			})]
		}, r))
	});
}, Dn = ({ item: e, onClose: t }) => {
	let { api: n } = O(), { error: r, busy: i, submit: a } = Rt(), [o, s] = (0, T.useState)(e.name), [c, l] = (0, T.useState)(e.days);
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Name",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: o,
					onChange: (e) => s(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: r,
				field: "name"
			}),
			/* @__PURE__ */ (0, A.jsx)(En, {
				days: c,
				onChange: l
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, {
				error: r,
				fields: ["name"]
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: i,
					onClick: async () => {
						let r = {
							name: o,
							days: c
						};
						await a(() => e.id ? n.update("pattern", e.id, r) : n.create("pattern", r)) && t();
					},
					children: "Save"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: t,
					children: "Cancel"
				})]
			})
		]
	});
}, On = () => {
	let { config: e } = O(), [t, n] = (0, T.useState)(null), [r, i] = (0, T.useState)(null);
	return t ? /* @__PURE__ */ (0, A.jsx)(Dn, {
		item: t,
		onClose: () => n(null)
	}) : /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
		/* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list",
			children: e.patterns.map((t) => /* @__PURE__ */ (0, A.jsxs)("li", { children: [
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "list-main",
					onClick: () => n(t),
					children: /* @__PURE__ */ (0, A.jsxs)("span", { children: [t.name, /* @__PURE__ */ (0, A.jsx)("span", {
						className: "muted list-detail",
						children: _t.filter((e) => t.days[e] && t.days[e].type !== "off").map((n) => `${qt(n).slice(0, 3)} ${Jt(t.days[n], e.shift_types)}`).join(" · ") || "All off"
					})] })
				}),
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button small",
					onClick: () => n({
						name: `${t.name} copy`,
						days: t.days
					}),
					children: "Duplicate"
				}),
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button small danger",
					onClick: () => i(t),
					children: "Delete"
				})
			] }, t.id))
		}),
		/* @__PURE__ */ (0, A.jsx)("button", {
			type: "button",
			className: "button primary",
			onClick: () => n({
				name: "",
				days: {}
			}),
			children: "Add week pattern"
		}),
		r && /* @__PURE__ */ (0, A.jsx)(wn, {
			kind: "pattern",
			item: r,
			replacements: e.patterns.filter((e) => e.id !== r.id),
			onClose: () => i(null)
		})
	] });
}, kn = 300, An = ({ kind: e, draft: t, start: n, weeks: r }) => {
	let { api: i, config: a } = O(), [o, s] = (0, T.useState)(null), [c, l] = (0, T.useState)(null), u = JSON.stringify(t);
	if ((0, T.useEffect)(() => {
		let t = !0, a = setTimeout(() => {
			i.preview(e, JSON.parse(u), n, yt(n, r * 7 - 1)).then((e) => {
				t && (s(e), l(null));
			}, (e) => t && l(e));
		}, kn);
		return () => {
			t = !1, clearTimeout(a);
		};
	}, [
		i,
		a,
		e,
		u,
		n,
		r
	]), c) return /* @__PURE__ */ (0, A.jsxs)("p", {
		className: "muted",
		children: ["Preview: ", c.message]
	});
	if (!o) return null;
	let d = Array.from({ length: r }, (e, t) => o.slice(t * 7, t * 7 + 7)).filter((e) => e.length > 0);
	return /* @__PURE__ */ (0, A.jsx)("div", {
		className: "preview",
		"aria-label": "Preview",
		children: d.map((e) => /* @__PURE__ */ (0, A.jsxs)("div", {
			className: "preview-row",
			children: [/* @__PURE__ */ (0, A.jsx)("span", {
				className: "muted",
				children: E(e[0].date, "d MMM")
			}), e.map((e) => /* @__PURE__ */ (0, A.jsx)("span", {
				className: "preview-cell",
				style: e.shift ? { borderBottomColor: e.shift.colour } : { opacity: .4 },
				title: e.date,
				children: e.shift ? Dt(e.shift.start) : "–"
			}, e.date))]
		}, e[0].date))
	});
}, jn = [
	"name",
	"anchor",
	"cycle_weeks",
	"slots",
	"active_from",
	"active_until"
], Mn = 8, Nn = 12, Pn = (e) => Math.min(Nn, Math.max(1, Math.round(e) || 1)), Fn = ({ item: e, onClose: t }) => {
	let { api: n, config: r, today: i } = O(), { error: a, busy: o, submit: s } = Rt(), c = xt(i), [l, u] = (0, T.useState)(e?.name ?? ""), [d, f] = (0, T.useState)(e?.anchor ?? c), [p, m] = (0, T.useState)(e?.slots ?? [r.patterns[0]?.id ?? null]), [h, g] = (0, T.useState)(e?.active_from ?? c), [_, v] = (0, T.useState)(e?.active_until ?? ""), y = {
		name: l,
		anchor: d,
		cycle_weeks: p.length,
		slots: p,
		active_from: h,
		active_until: _ || null,
		...e ? { priority: e.priority } : {}
	}, b = async () => {
		await s(() => e ? n.update("rotation", e.id, y) : n.create("rotation", y)) && t();
	};
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Name",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: l,
					onChange: (e) => u(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "name"
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "form-row",
				children: [/* @__PURE__ */ (0, A.jsx)(N, {
					label: "Start date (a Monday)",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "date",
						value: d,
						onChange: (e) => e.target.value && f(xt(e.target.value))
					})
				}), /* @__PURE__ */ (0, A.jsx)(N, {
					label: "Cycle length (weeks)",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "number",
						min: 1,
						max: Nn,
						value: p.length,
						onChange: (e) => m(Yt(p, Pn(Number(e.target.value))))
					})
				})]
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "anchor"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "cycle_weeks"
			}),
			p.map((e, t) => /* @__PURE__ */ (0, A.jsx)(N, {
				label: `Week ${t + 1}`,
				children: /* @__PURE__ */ (0, A.jsxs)("select", {
					value: e ?? "",
					onChange: (e) => m(p.map((n, r) => r === t ? e.target.value || null : n)),
					children: [/* @__PURE__ */ (0, A.jsx)("option", {
						value: "",
						children: "Empty"
					}), r.patterns.map((e) => /* @__PURE__ */ (0, A.jsx)("option", {
						value: e.id,
						children: e.name
					}, e.id))]
				})
			}, t)),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "slots"
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "form-row",
				children: [/* @__PURE__ */ (0, A.jsx)(N, {
					label: "Active from",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "date",
						value: h,
						onChange: (e) => g(e.target.value)
					})
				}), /* @__PURE__ */ (0, A.jsx)(N, {
					label: "Active until (optional)",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "date",
						value: _,
						onChange: (e) => v(e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "active_from"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "active_until"
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, {
				error: a,
				fields: jn
			}),
			/* @__PURE__ */ (0, A.jsx)(An, {
				kind: "rotation",
				draft: {
					...y,
					name: l || "Preview",
					id: e?.id
				},
				start: c,
				weeks: Mn
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: o,
					onClick: b,
					children: "Save"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: t,
					children: "Cancel"
				})]
			})
		]
	});
}, In = ({ onClose: e }) => {
	let { api: t, config: n, today: r } = O(), { error: i, busy: a, submit: o, setError: s } = Rt(), [c, l] = (0, T.useState)(2), [u, d] = (0, T.useState)("mon"), [f, p] = (0, T.useState)(n.shift_types[0]?.id), [m, h] = (0, T.useState)(r);
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "form-row",
				children: [/* @__PURE__ */ (0, A.jsx)(N, {
					label: "Every (weeks)",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "number",
						min: 1,
						max: Nn,
						value: c,
						onChange: (e) => l(Pn(Number(e.target.value)))
					})
				}), /* @__PURE__ */ (0, A.jsx)(N, {
					label: "On",
					children: /* @__PURE__ */ (0, A.jsx)("select", {
						value: u,
						onChange: (e) => d(e.target.value),
						children: _t.map((e) => /* @__PURE__ */ (0, A.jsx)("option", {
							value: e,
							children: qt(e)
						}, e))
					})
				})]
			}),
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Shift type",
				children: /* @__PURE__ */ (0, A.jsx)("select", {
					value: f ?? "",
					onChange: (e) => p(e.target.value),
					children: n.shift_types.map((e) => /* @__PURE__ */ (0, A.jsx)("option", {
						value: e.id,
						children: e.name
					}, e.id))
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Starting",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					type: "date",
					value: m,
					onChange: (e) => h(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, { error: i }),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: a,
					onClick: async () => {
						let r = n.shift_types.find((e) => e.id === f);
						if (!r) {
							s({
								code: "required",
								message: "Add a shift type first"
							});
							return;
						}
						if (!m) {
							s({
								code: "required",
								message: "Choose a starting date"
							});
							return;
						}
						let i = k(c, u, r, m);
						await o(async () => {
							let e = await t.create("pattern", i.pattern);
							try {
								await t.create("rotation", i.rotation(e.id));
							} catch (n) {
								throw await t.remove("pattern", e.id).catch(() => void 0), n;
							}
						}) && e();
					},
					children: "Create"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: e,
					children: "Cancel"
				})]
			})
		]
	});
}, Ln = () => {
	let { api: e, config: t } = O(), { error: n, busy: r, submit: i } = Rt(), [a, o] = (0, T.useState)(null), [s, c] = (0, T.useState)(!1), [l, u] = (0, T.useState)(null), d = Xt(t.rotations);
	if (s) return /* @__PURE__ */ (0, A.jsx)(In, { onClose: () => c(!1) });
	if (a) return /* @__PURE__ */ (0, A.jsx)(Fn, {
		item: a === "new" ? null : a,
		onClose: () => o(null)
	});
	let f = (t, n) => i(async () => {
		for (let r of Zt(d, t, n)) await e.update("rotation", r.id, { priority: r.priority });
	});
	return /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
		/* @__PURE__ */ (0, A.jsx)(gn, { error: n }),
		/* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list",
			children: d.map((e, t) => /* @__PURE__ */ (0, A.jsxs)("li", { children: [
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "list-main",
					onClick: () => o(e),
					children: /* @__PURE__ */ (0, A.jsxs)("span", { children: [e.name, /* @__PURE__ */ (0, A.jsxs)("span", {
						className: "muted list-detail",
						children: [e.cycle_weeks, "-week cycle"]
					})] })
				}),
				/* @__PURE__ */ (0, A.jsx)(pn, {
					path: j.up,
					label: "Higher priority",
					disabled: r || t === 0,
					onClick: () => f(e.id, -1)
				}),
				/* @__PURE__ */ (0, A.jsx)(pn, {
					path: j.down,
					label: "Lower priority",
					disabled: r || t === d.length - 1,
					onClick: () => f(e.id, 1)
				}),
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button small danger",
					onClick: () => u(e),
					children: "Delete"
				})
			] }, e.id))
		}),
		/* @__PURE__ */ (0, A.jsxs)("div", {
			className: "actions",
			children: [/* @__PURE__ */ (0, A.jsx)("button", {
				type: "button",
				className: "button primary",
				onClick: () => o("new"),
				children: "Add rotation"
			}), /* @__PURE__ */ (0, A.jsx)("button", {
				type: "button",
				className: "button",
				onClick: () => c(!0),
				children: "Quick add: recurring shift"
			})]
		}),
		l && /* @__PURE__ */ (0, A.jsx)(wn, {
			kind: "rotation",
			item: l,
			onClose: () => u(null)
		})
	] });
}, Rn = {
	name: "",
	start: "09:00",
	end: "17:00",
	colour: "#2196f3",
	notes: ""
}, zn = [
	"name",
	"start",
	"end",
	"colour"
], Bn = ({ item: e, onClose: t }) => {
	let { api: n } = O(), { error: r, busy: i, submit: a } = Rt(), [o, s] = (0, T.useState)({
		...Rn,
		...e
	}), c = (e, t) => s((n) => ({
		...n,
		[e]: t
	}));
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Name",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: o.name,
					onChange: (e) => c("name", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: r,
				field: "name"
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "form-row",
				children: [
					/* @__PURE__ */ (0, A.jsx)(N, {
						label: "Start",
						children: /* @__PURE__ */ (0, A.jsx)("input", {
							type: "time",
							value: o.start,
							onChange: (e) => c("start", e.target.value)
						})
					}),
					/* @__PURE__ */ (0, A.jsx)(N, {
						label: D(o.start, o.end) ? "End (+1)" : "End",
						children: /* @__PURE__ */ (0, A.jsx)("input", {
							type: "time",
							value: o.end,
							onChange: (e) => c("end", e.target.value)
						})
					}),
					/* @__PURE__ */ (0, A.jsx)(N, {
						label: "Colour",
						children: /* @__PURE__ */ (0, A.jsx)("input", {
							type: "color",
							value: o.colour,
							onChange: (e) => c("colour", e.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: r,
				field: "start"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: r,
				field: "end"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: r,
				field: "colour"
			}),
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Notes",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: o.notes,
					onChange: (e) => c("notes", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, {
				error: r,
				fields: zn
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: i,
					onClick: async () => {
						let r = {
							name: o.name,
							start: o.start,
							end: o.end,
							colour: o.colour,
							notes: o.notes || null
						};
						await a(() => e ? n.update("shift_type", e.id, r) : n.create("shift_type", r)) && t();
					},
					children: "Save"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: t,
					children: "Cancel"
				})]
			})
		]
	});
}, Vn = () => {
	let { config: e } = O(), [t, n] = (0, T.useState)(null), [r, i] = (0, T.useState)(null);
	return t ? /* @__PURE__ */ (0, A.jsx)(Bn, {
		item: t === "new" ? null : t,
		onClose: () => n(null)
	}) : /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
		/* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list",
			children: e.shift_types.map((e) => /* @__PURE__ */ (0, A.jsxs)("li", { children: [/* @__PURE__ */ (0, A.jsxs)("button", {
				type: "button",
				className: "list-main",
				onClick: () => n(e),
				children: [/* @__PURE__ */ (0, A.jsx)("span", {
					className: "swatch",
					style: { background: e.colour }
				}), /* @__PURE__ */ (0, A.jsxs)("span", { children: [e.name, /* @__PURE__ */ (0, A.jsxs)("span", {
					className: "muted",
					children: [
						" ",
						e.start,
						"–",
						e.end,
						D(e.start, e.end) ? " (+1)" : ""
					]
				})] })]
			}), /* @__PURE__ */ (0, A.jsx)("button", {
				type: "button",
				className: "button small danger",
				onClick: () => i(e),
				children: "Delete"
			})] }, e.id))
		}),
		/* @__PURE__ */ (0, A.jsx)("button", {
			type: "button",
			className: "button primary",
			onClick: () => n("new"),
			children: "Add shift type"
		}),
		r && /* @__PURE__ */ (0, A.jsx)(wn, {
			kind: "shift_type",
			item: r,
			replacements: e.shift_types.filter((e) => e.id !== r.id),
			onClose: () => i(null)
		})
	] });
}, Hn = [
	"name",
	"start_date",
	"end_date",
	"mode",
	"pattern_id",
	"days"
], Un = 8, Wn = { type: "off" }, Gn = ({ days: e, onChange: t }) => {
	let { config: n } = O();
	return /* @__PURE__ */ (0, A.jsx)("div", {
		className: "days",
		children: _t.map((r) => {
			let i = e[r], a = (n) => {
				let i = { ...e };
				n ? i[r] = Wn : delete i[r], t(i);
			};
			return /* @__PURE__ */ (0, A.jsxs)("div", {
				className: "days-row wide",
				children: [/* @__PURE__ */ (0, A.jsxs)("label", {
					className: "check",
					children: [/* @__PURE__ */ (0, A.jsx)("input", {
						type: "checkbox",
						checked: i !== void 0,
						onChange: (e) => a(e.target.checked)
					}), qt(r).slice(0, 3)]
				}), i ? /* @__PURE__ */ (0, A.jsx)(dn, {
					value: i,
					shiftTypes: n.shift_types,
					onChange: (n) => t({
						...e,
						[r]: n
					})
				}) : /* @__PURE__ */ (0, A.jsx)("span", {
					className: "muted days-unchanged",
					children: "No change"
				})]
			}, r);
		})
	});
}, Kn = ({ item: e, onClose: t }) => {
	let { api: n, config: r, today: i } = O(), { error: a, busy: o, submit: s } = Rt(), [c, l] = (0, T.useState)(e?.name ?? ""), [u, d] = (0, T.useState)(e?.start_date ?? i), [f, p] = (0, T.useState)(e?.end_date ?? i), [m, h] = (0, T.useState)(e?.mode ?? "pattern"), [g, _] = (0, T.useState)(e?.pattern_id ?? r.patterns[0]?.id ?? ""), [v, y] = (0, T.useState)(e?.days ?? {}), b = {
		name: c,
		start_date: u,
		end_date: f,
		mode: m,
		...m === "pattern" ? { pattern_id: g } : { days: v }
	}, ee = async () => {
		await s(() => e ? n.update("variation", e.id, b) : n.create("variation", b)) && t();
	}, te = xt(u || i), x = f ? Math.min(Un, Math.max(1, se(Xe(f), Xe(te), { weekStartsOn: 1 }) + 2)) : 1;
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "form",
		children: [
			/* @__PURE__ */ (0, A.jsx)(N, {
				label: "Name",
				children: /* @__PURE__ */ (0, A.jsx)("input", {
					value: c,
					onChange: (e) => l(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "name"
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "form-row",
				children: [/* @__PURE__ */ (0, A.jsx)(N, {
					label: "From",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "date",
						value: u,
						onChange: (e) => d(e.target.value)
					})
				}), /* @__PURE__ */ (0, A.jsx)(N, {
					label: "To",
					children: /* @__PURE__ */ (0, A.jsx)("input", {
						type: "date",
						value: f,
						onChange: (e) => p(e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "start_date"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "end_date"
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "segmented fit",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: m === "pattern" ? "selected" : "",
					onClick: () => h("pattern"),
					children: "Use a pattern"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: m === "days" ? "selected" : "",
					onClick: () => h("days"),
					children: "Edit weekdays"
				})]
			}),
			m === "pattern" ? /* @__PURE__ */ (0, A.jsx)(N, {
				label: "Pattern",
				children: /* @__PURE__ */ (0, A.jsx)("select", {
					value: g,
					onChange: (e) => _(e.target.value),
					children: r.patterns.map((e) => /* @__PURE__ */ (0, A.jsx)("option", {
						value: e.id,
						children: e.name
					}, e.id))
				})
			}) : /* @__PURE__ */ (0, A.jsx)(Gn, {
				days: v,
				onChange: y
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "pattern_id"
			}),
			/* @__PURE__ */ (0, A.jsx)(M, {
				error: a,
				field: "days"
			}),
			/* @__PURE__ */ (0, A.jsx)(gn, {
				error: a,
				fields: Hn
			}),
			/* @__PURE__ */ (0, A.jsx)(An, {
				kind: "variation",
				draft: {
					...b,
					name: c || "Preview",
					id: e?.id
				},
				start: te,
				weeks: x
			}),
			/* @__PURE__ */ (0, A.jsxs)("div", {
				className: "actions",
				children: [/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					disabled: o,
					onClick: ee,
					children: "Save"
				}), /* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button",
					onClick: t,
					children: "Cancel"
				})]
			})
		]
	});
}, qn = [
	{
		title: "Shift types",
		component: Vn
	},
	{
		title: "Week patterns",
		component: On
	},
	{
		title: "Rotations",
		component: Ln
	},
	{
		title: "Variations",
		component: () => {
			let { config: e, today: t } = O(), [n, r] = (0, T.useState)(null), [i, a] = (0, T.useState)(null);
			if (n) return /* @__PURE__ */ (0, A.jsx)(Kn, {
				item: n === "new" ? null : n,
				onClose: () => r(null)
			});
			let o = $t(e.variations, t), s = [
				["Active", o.active],
				["Upcoming", o.upcoming],
				["Past", o.past]
			];
			return /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
				s.map(([e, t]) => t.length > 0 && /* @__PURE__ */ (0, A.jsxs)("section", { children: [/* @__PURE__ */ (0, A.jsx)("h4", {
					className: "muted group-title",
					children: e
				}), /* @__PURE__ */ (0, A.jsx)("ul", {
					className: "list",
					children: t.map((e) => /* @__PURE__ */ (0, A.jsxs)("li", { children: [/* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "list-main",
						onClick: () => r(e),
						children: /* @__PURE__ */ (0, A.jsxs)("span", { children: [e.name, /* @__PURE__ */ (0, A.jsxs)("span", {
							className: "muted list-detail",
							children: [
								E(e.start_date, "d MMM"),
								" –",
								" ",
								E(e.end_date, "d MMM yyyy")
							]
						})] })
					}), /* @__PURE__ */ (0, A.jsx)("button", {
						type: "button",
						className: "button small danger",
						onClick: () => a(e),
						children: "Delete"
					})] }, e.id))
				})] }, e)),
				/* @__PURE__ */ (0, A.jsx)("button", {
					type: "button",
					className: "button primary",
					onClick: () => r("new"),
					children: "Add variation"
				}),
				i && /* @__PURE__ */ (0, A.jsx)(wn, {
					kind: "variation",
					item: i,
					onClose: () => a(null)
				})
			] });
		}
	},
	{
		title: "Exceptions",
		component: Cn
	},
	{
		title: "Backup",
		component: xn,
		readOnly: !0
	}
], Jn = () => {
	let { canEdit: e } = O(), [t, n] = (0, T.useState)(null), r = qn.filter((t) => e || t.readOnly);
	if (t) {
		let e = t.component;
		return /* @__PURE__ */ (0, A.jsxs)("main", {
			className: "content",
			children: [
				/* @__PURE__ */ (0, A.jsxs)("button", {
					type: "button",
					className: "breadcrumb",
					onClick: () => n(null),
					children: [/* @__PURE__ */ (0, A.jsx)(fn, { path: j.left }), " Settings"]
				}),
				/* @__PURE__ */ (0, A.jsx)("h3", {
					className: "screen-title",
					children: t.title
				}),
				/* @__PURE__ */ (0, A.jsx)(e, {})
			]
		});
	}
	return /* @__PURE__ */ (0, A.jsxs)("main", {
		className: "content",
		children: [!e && /* @__PURE__ */ (0, A.jsx)("p", {
			className: "muted screen-title",
			children: "You can view this roster but not change it."
		}), /* @__PURE__ */ (0, A.jsx)("ul", {
			className: "list",
			children: r.map((e) => /* @__PURE__ */ (0, A.jsx)("li", { children: /* @__PURE__ */ (0, A.jsxs)("button", {
				type: "button",
				className: "list-main",
				onClick: () => n(e),
				children: [/* @__PURE__ */ (0, A.jsx)("span", { children: e.title }), /* @__PURE__ */ (0, A.jsx)(fn, { path: j.right })]
			}) }, e.title))
		})]
	});
}, Yn = 6e4, Xn = (e) => {
	let [t, n] = (0, T.useState)(() => Et(e));
	return (0, T.useEffect)(() => {
		let t = setInterval(() => n(Et(e)), Yn);
		return () => clearInterval(t);
	}, [e]), t;
}, Zn = ({ narrow: e }) => {
	let t = Mt(), { rosters: n, error: r } = Pt(), [i, a] = (0, T.useState)(null), [o, s] = (0, T.useState)(!1), c = (0, T.useRef)(null), l = Xn(t.config.time_zone), u = n?.find((e) => e.entry_id === i) ?? n?.[0], d = u?.entry_id ?? null, { api: f, config: p, error: m } = Ft(d), h = u?.can_edit ?? !1, g = (0, T.useMemo)(() => f && p ? {
		api: f,
		config: p,
		canEdit: h,
		today: l
	} : null, [
		f,
		p,
		h,
		l
	]);
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "app",
		ref: c,
		children: [
			/* @__PURE__ */ (0, A.jsxs)("header", {
				className: "header",
				children: [
					o ? /* @__PURE__ */ (0, A.jsx)(pn, {
						path: j.back,
						label: "Back",
						onClick: () => s(!1)
					}) : e && /* @__PURE__ */ (0, A.jsx)(pn, {
						path: j.menu,
						label: "Menu",
						onClick: () => c.current?.dispatchEvent(new CustomEvent("hass-toggle-menu", {
							bubbles: !0,
							composed: !0
						}))
					}),
					n && n.length > 1 ? /* @__PURE__ */ (0, A.jsx)("select", {
						className: "roster-switcher",
						"aria-label": "Roster",
						value: d ?? "",
						onChange: (e) => a(e.target.value),
						children: n.map((e) => /* @__PURE__ */ (0, A.jsx)("option", {
							value: e.entry_id,
							children: e.title
						}, e.entry_id))
					}) : /* @__PURE__ */ (0, A.jsx)("h1", { children: u?.title ?? "Roster" }),
					!o && g && /* @__PURE__ */ (0, A.jsx)(pn, {
						path: j.gear,
						label: "Settings",
						onClick: () => s(!0)
					})
				]
			}),
			(r ?? m) && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "error content",
				children: (r ?? m)?.message
			}),
			n?.length === 0 && /* @__PURE__ */ (0, A.jsx)("p", {
				className: "content muted",
				children: "Add a roster under Settings → Devices & services."
			}),
			g && /* @__PURE__ */ (0, A.jsx)(Nt.Provider, {
				value: g,
				children: o ? /* @__PURE__ */ (0, A.jsx)(Jn, {}) : /* @__PURE__ */ (0, A.jsx)(bn, { narrow: e })
			})
		]
	});
}, Qn = ":host{height:100%;color:var(--primary-text-color);background:var(--primary-background-color);font-family:var(--paper-font-body1_-_font-family,Roboto, sans-serif);-webkit-text-size-adjust:100%;font-size:15px;display:block}*{box-sizing:border-box}h1,h2,h3,p{margin:0}.app{min-height:100vh}.muted{color:var(--secondary-text-color)}.error{color:var(--error-color,#db4437);font-size:13px}.warning{color:var(--warning-color,#ffa600);font-size:13px}.header{min-height:56px;padding:0 8px;padding-top:env(safe-area-inset-top);color:var(--app-header-text-color,#fff);background:var(--app-header-background-color,var(--primary-color));align-items:center;gap:4px;display:flex}.header h1,.roster-switcher{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;margin-left:8px;font-size:20px;font-weight:400;overflow:hidden}.header select.roster-switcher{width:auto;color:inherit;background:0 0;border:none}.header select.roster-switcher option{color:var(--primary-text-color);background:var(--card-background-color)}.content{max-width:760px;padding:12px 12px calc(24px + env(safe-area-inset-bottom));margin:0 auto}.summary{margin-bottom:8px;font-weight:500}.toolbar{flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:8px;display:flex}.toolbar-title{text-align:center;min-width:118px}.icon-button{width:44px;height:44px;color:inherit;cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;display:inline-flex}.icon-button:disabled{opacity:.3;cursor:default}.button{min-height:44px;color:var(--primary-color);font:inherit;border:1px solid var(--divider-color);cursor:pointer;background:0 0;border-radius:8px;padding:0 16px;font-weight:500}.button.small{min-height:36px;padding:0 10px}.button.primary{color:var(--text-primary-color,#fff);background:var(--primary-color);border-color:var(--primary-color)}.button.danger{color:var(--error-color,#db4437)}.button:disabled{opacity:.5}.segmented{border:1px solid var(--divider-color);border-radius:8px;margin-left:auto;display:inline-flex;overflow:hidden}.segmented button{min-height:36px;color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;padding:0 10px}.segmented .selected{color:var(--text-primary-color,#fff);background:var(--primary-color)}.week{flex-direction:column;gap:6px;display:flex}.week-row{width:100%;min-height:60px;color:inherit;font:inherit;text-align:left;background:var(--card-background-color);cursor:pointer;border:1px solid #0000;border-radius:10px;align-items:center;gap:10px;padding:8px 12px;display:flex}.today{border-color:var(--primary-color)!important}.in-variation{box-shadow:inset 0 0 0 1px var(--divider-color);outline:1px dashed var(--secondary-text-color);outline-offset:-3px}.week-date{flex-direction:column;align-items:center;width:36px;display:flex}.colour-bar{border-radius:2px;flex:none;width:4px;height:36px;display:inline-block}.week-shift{flex-direction:column;flex:1;min-width:0;display:flex}.marker.plus{color:var(--primary-color);font-weight:700}.marker.dot{background:var(--primary-color);border-radius:50%;width:7px;height:7px;display:inline-block}.month{grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;display:grid}.month-heading{text-align:center;padding:4px 0;font-size:12px}.month-cell{min-height:58px;color:inherit;font:inherit;background:var(--card-background-color);cursor:pointer;border:1px solid #0000;border-radius:8px;flex-direction:column;align-items:center;gap:4px;padding:6px 2px;display:flex}.month-cell.outside{opacity:.45}.month-number{align-items:center;gap:3px;font-size:13px;display:inline-flex}.month-dot{border-radius:50%;width:10px;height:10px}.month-time{border-left:3px solid;padding-left:4px;font-size:12px}.sheet-backdrop{z-index:10;background:#00000073;justify-content:center;align-items:flex-end;display:flex;position:fixed;inset:0}.sheet{width:100%;max-width:520px;max-height:85vh;padding:18px 16px calc(18px + env(safe-area-inset-bottom));background:var(--card-background-color);border-radius:16px 16px 0 0;flex-direction:column;gap:12px;display:flex;overflow-y:auto}.sheet h2{font-size:18px;font-weight:500}.sheet-shift{align-items:center;gap:8px;display:flex}.actions{flex-wrap:wrap;gap:8px;display:flex}.field{color:var(--secondary-text-color);flex-direction:column;gap:4px;font-size:13px;display:flex}input,select{width:100%;min-height:44px;color:var(--primary-text-color);font:inherit;background:var(--secondary-background-color,transparent);border:1px solid var(--divider-color);border-radius:8px;padding:0 10px;font-size:16px}input[type=color]{padding:4px}input[type=checkbox]{width:auto;min-height:0}.assignment{flex-direction:column;gap:6px;min-width:0;display:flex}.assignment-times{align-items:center;gap:6px;display:flex}.assignment-times input{min-width:0}.breadcrumb{min-height:44px;color:var(--primary-color);font:inherit;cursor:pointer;background:0 0;border:none;align-items:center;padding:0;display:inline-flex}.screen-title{margin-bottom:12px}.list{flex-direction:column;gap:6px;margin:0 0 12px;padding:0;list-style:none;display:flex}.list li{background:var(--card-background-color);border-radius:10px;align-items:center;gap:4px;padding-right:8px;display:flex}.list-main{min-width:0;min-height:52px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:none;flex:1;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;display:flex}.list-main>span:last-child:not(.swatch){flex:1;min-width:0}.list-detail{text-overflow:ellipsis;white-space:nowrap;font-size:13px;display:block;overflow:hidden}.swatch{border-radius:50%;flex:none;width:18px;height:18px}.form{flex-direction:column;gap:10px;display:flex}.form-row{gap:8px;display:flex}.form-row .field{flex:1;min-width:0}.days{flex-direction:column;gap:6px;display:flex}.days-row{grid-template-columns:40px minmax(0,1fr);align-items:start;gap:8px;display:grid}.days-row>span{padding-top:12px}.preview{flex-direction:column;gap:3px;font-size:12px;display:flex}.preview-row{grid-template-columns:48px repeat(7,minmax(0,1fr));align-items:center;gap:2px;display:grid}.preview-cell{text-align:center;background:var(--card-background-color);border-bottom:2px solid #0000;padding:3px 0}.group-title{margin:8px 0 6px;font-size:13px;font-weight:500}.days-row.wide{grid-template-columns:72px minmax(0,1fr)}.check{align-items:center;gap:6px;min-height:44px;display:flex}.days-unchanged{padding-top:12px}.segmented.fit{align-self:flex-start;margin-left:0}.past{opacity:.75;margin-top:8px}.export{width:100%;color:var(--primary-text-color);background:var(--secondary-background-color,transparent);border:1px solid var(--divider-color);border-radius:8px;padding:8px;font-family:monospace;font-size:12px}.file-button{justify-content:center;align-items:center;display:inline-flex}.file-button input{display:none}", $n = class extends HTMLElement {
	root;
	currentHass;
	currentNarrow = !1;
	set hass(e) {
		let t = this.currentHass?.connection !== e.connection || this.currentHass?.config.time_zone !== e.config.time_zone;
		this.currentHass = e, t && this.render();
	}
	set narrow(e) {
		e !== this.currentNarrow && (this.currentNarrow = e, this.render());
	}
	connectedCallback() {
		let e = this.shadowRoot?.querySelector("div");
		if (!e) {
			let t = this.attachShadow({ mode: "open" }), n = document.createElement("style");
			n.textContent = Qn, e = document.createElement("div"), t.append(n, e);
		}
		this.root ??= (0, gt.createRoot)(e), this.render();
	}
	disconnectedCallback() {
		this.root?.unmount(), this.root = void 0;
	}
	render() {
		this.root && this.currentHass && this.root.render(/* @__PURE__ */ (0, A.jsx)(jt.Provider, {
			value: this.currentHass,
			children: /* @__PURE__ */ (0, A.jsx)(Zn, { narrow: this.currentNarrow })
		}));
	}
};
customElements.get("roster-planner-panel") || customElements.define("roster-planner-panel", $n);
