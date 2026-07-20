!function() {
  var t;
  try {
      var e = window.encodeURIComponent;
      function n(t) {
          return t
      }
      function r() {
          return Math.random().toString(36).slice(2)
      }
      var o, i = n("230508-112541-237"), a = n("wwopendata.web"), c = n("27604b517af9c8d822986e58f4d0213aa484d3d6546d59da6617d6335b896937"), u = n("3JSGf+Vu08svMGkaJbGxmE7dKJR+rkLdrWBb/3KhmQZh8QSD9zr+SLmWEuZwjGvA2ngGMSwHYqowY7nvWiieaQCoHp9STLVo/fpyFoyu18u0wJyrTYqIS7fxThcpNwXN"), l = n("lhty82aw.CDqrN1I3TpGxhhFdHd4SESPqHSYjQuCmoVQ2skY5n8Px"), s = n("".concat(a, "@").concat(i)), f = location.origin || "".concat(location.protocol, "//").concat(location.host), d = "https://open.work.weixin.qq.com", p = "".concat(d, "/wwopen/openData/frame/index#origin=").concat(e(f)), v = [], h = l;
      function g(t) {
          v.unshift({
              level: 2,
              msg: t
          })
      }
      function w(t) {
          v.unshift({
              level: 4,
              msg: t
          }),
          y()
      }
      function y() {
          o || (o = setTimeout(m, 10))
      }
      function m() {
          o = void 0,
          0 !== v.length && (!function(t, n) {
              var r = new XMLHttpRequest;
              "withCredentials"in r || (r = new XDomainRequest);
              for (var o = [], i = n.length, a = 0; a < i; a++)
                  o.push(["msg[".concat(a, "]=").concat(e(n[a].msg)), "level[".concat(a, "]=").concat(n[a].level)].join("&"));
              o.push("count=".concat(i)),
              r.open("POST", t),
              r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
              r.send(o.join("&"))
          }("".concat("https://aegis.qq.com/collect", "?id=").concat("bRLDot6R4Kymzz0jPO") + "&from=".concat(f) + "&sessionId=".concat(e(h)) + "&version=".concat(e(s)), v.reverse()),
          v = [])
      }
      var b = {};
      function O(t, e) {
          A(b, t) || (b[t] = []),
          b[t].push(e)
      }
      function E(t, e) {
          if (A(b, t)) {
              var n = b[t]
                , r = n.indexOf(e);
              r >= 0 && n.splice(r, 1)
          }
      }
      function S(t, e) {
          var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
          if (A(b, t))
              if (n) {
                  var r = {
                      type: t,
                      detail: e
                  };
                  b[t].forEach((function(e) {
                      try {
                          e(r)
                      } catch (e) {
                          console.log("[event] ".concat(t, " error: ").concat(e))
                      }
                  }
                  ))
              } else
                  S(t, e, !0)
      }
      function A(t, e) {
          return Object.prototype.hasOwnProperty.call(t, e)
      }
      function C(t, e) {
          return function() {
              for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
                  r[o] = arguments[o];
              try {
                  return e.apply(this, r)
              } catch (e) {
                  k(e, t),
                  S("error", e)
              }
          }
      }
      t = {
          captureException: k
      };
      var _ = D(g)
        , j = D((function(t) {
          v.unshift({
              level: 2,
              msg: t
          }),
          y()
      }
      ))
        , x = D(w);
      function k(t, e) {
          w("[".concat(e, "] ").concat(M(t)))
      }
      function D(t) {
          return function() {
              for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
                  n[r] = arguments[r];
              for (var o = [], i = 0, a = n.length; i < a; i++)
                  o.push(T(n[i]));
              t(o.join(" "))
          }
      }
      function T(t) {
          return t ? "object" != typeof t ? t : "string" == typeof t.stack ? M(t) : JSON.stringify(t) : t
      }
      function M(t) {
          return "".concat(t, " ").concat(t.stack)
      }
      var R = Object.freeze({
          __proto__: null,
          wrap: C,
          log: _,
          warn: j,
          error: x,
          captureMessage: function(t) {
              g(t),
              m()
          },
          captureException: k
      });
      function P(t, e) {
          (null == e || e > t.length) && (e = t.length);
          for (var n = 0, r = new Array(e); n < e; n++)
              r[n] = t[n];
          return r
      }
      function W(t) {
          return function(t) {
              if (Array.isArray(t))
                  return P(t)
          }(t) || function(t) {
              if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"])
                  return Array.from(t)
          }(t) || function(t, e) {
              if (!t)
                  return;
              if ("string" == typeof t)
                  return P(t, e);
              var n = Object.prototype.toString.call(t).slice(8, -1);
              "Object" === n && t.constructor && (n = t.constructor.name);
              if ("Map" === n || "Set" === n)
                  return Array.from(n);
              if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                  return P(t, e)
          }(t) || function() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
          }()
      }
      var q = "[ww-open-data]";
      function F() {
          for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++)
              e[n] = arguments[n]
      }
      function I() {
          for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++)
              e[n] = arguments[n];
          var r;
          (r = R).log.apply(r, W(e))
      }
      function N() {
          for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++)
              e[n] = arguments[n];
          var r;
          (r = R).warn.apply(r, W(e))
      }
      function L() {
          for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++)
              e[n] = arguments[n];
          var r;
          (r = R).error.apply(r, W(e))
      }
      var U = Function.prototype.call;
      function z(t) {
          var e = Object.create(null);
          return Object.getOwnPropertyNames(t).forEach((function(n) {
              if ("prototype" !== n) {
                  var r = Object.getOwnPropertyDescriptor(t, n)
                    , o = Object.create(null);
                  H(o, "value", r.value),
                  H(o, "get", r.get),
                  H(o, "set", r.set),
                  H(e, n, Object.freeze(o))
              }
          }
          )),
          e
      }
      function H(t, e, n) {
          Object.defineProperty(t, e, {
              value: n,
              enumerable: !0
          })
      }
      var J = function() {
          var t = {
              JSON: window.JSON,
              Promise: window.Promise,
              Uint8Array: window.Uint8Array,
              Function: window.Function,
              Object: window.Object,
              Array: window.Array,
              String: window.String,
              WeakMap: window.WeakMap,
              Element: window.Element,
              ShadowRoot: window.ShadowRoot,
              Image: window.Image,
              Node: window.Node,
              EventTarget: window.EventTarget,
              HTMLIFrameElement: window.HTMLIFrameElement,
              CanvasRenderingContext2D: window.CanvasRenderingContext2D
          }
            , e = {
              fetch: window.fetch,
              parseInt: window.parseInt,
              setTimeout: window.setTimeout
          }
            , n = Object.create(null);
          return H(n, "protected", Object.create(null)),
          H(n, "singleton", Object.create(null)),
          Object.keys(t).forEach((function(e) {
              t[e] && (H(n.singleton, e, t[e]),
              H(n.protected, e, z(t[e])),
              t[e].prototype && (H(n.protected[e], "prototype", z(t[e].prototype)),
              Object.freeze(n.protected[e].prototype)),
              Object.freeze(n.protected[e]))
          }
          )),
          Object.keys(e).forEach((function(t) {
              H(n.singleton, t, e[t])
          }
          )),
          H(n.singleton, "call", U.bind(U)),
          Object.defineProperty(n, "__version__", {
              value: s
          }),
          Object.freeze(n.protected),
          Object.freeze(n.singleton),
          Object.freeze(n),
          n
      }()
        , B = null == J ? void 0 : J.protected
        , V = null == J ? void 0 : J.singleton
        , X = (null == V ? void 0 : V.call) || Function.prototype.call.bind(Function.prototype.call)
        , K = mt(B, "Function.prototype.bind")
        , Y = mt(B, "Function.prototype.call")
        , $ = function(t) {
          return t && X(K, Y, t)
      };
      mt(B, "Object.keys");
      var G = mt(B, "Object.defineProperty")
        , Q = mt(V, "setTimeout", "direct")
        , Z = $(mt(B, "Object.prototype.hasOwnProperty"))
        , tt = $(mt(B, "Array.prototype.push"))
        , et = $(mt(B, "Array.prototype.forEach"))
        , nt = $(mt(B, "Array.prototype.slice"))
        , rt = $(mt(B, "String.prototype.indexOf"))
        , ot = $(mt(B, "String.prototype.slice"))
        , it = mt(V, "Image", "direct")
        , at = $(mt(B, "Image.prototype.src", "set")) || $(mt(B, "HTMLImageElement.prototype.src", "set")) || function(t, e) {
          t.src = e
      }
        , ct = $(mt(B, "HTMLIframeElement.prototype.contentWindow", "get")) || function(t) {
          return t.contentWindow
      }
        , ut = $(mt(B, "HTMLIframeElement.prototype.contentDocument", "get")) || function(t) {
          return t.contentDocument
      }
        , lt = $(mt(B, "EventTarget.prototype.addEventListener")) || function(t, e, n) {
          t.addEventListener(e, n)
      }
        , st = $(mt(B, "CanvasRenderingContext2D.prototype.fillText"))
        , ft = $(mt(B, "CanvasRenderingContext2D.prototype.drawImage"))
        , dt = $(mt(B, "CanvasRenderingContext2D.prototype.strokeText"))
        , pt = $(mt(B, "CanvasRenderingContext2D.prototype.measureText"))
        , vt = mt(V, "WeakMap", "direct")
        , ht = $(mt(B, "WeakMap.prototype.get"))
        , gt = $(mt(B, "WeakMap.prototype.set"))
        , wt = $(mt(B, "Element.prototype.attachShadow"))
        , yt = $(mt(B, "Node.prototype.textContent", "set"));
      function mt(t, e) {
          var n, r, o, i, a, c = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "value", u = (null == B || null === (n = B.String) || void 0 === n ? void 0 : n.prototype.split.value) || window.String.prototype.split, l = (null == B || null === (r = B.Array) || void 0 === r ? void 0 : r.prototype.pop.value) || window.Array.prototype.pop, s = (null == B || null === (o = B.Array) || void 0 === o ? void 0 : o.prototype.forEach.value) || window.Array.prototype.forEach, f = (null == B || null === (i = B.Object) || void 0 === i ? void 0 : i.getOwnPropertyDescriptor.value) || Object.getOwnPropertyDescriptor, d = X(u, e, "."), p = X(l, d), v = t, h = window;
          if (X(s, d, (function(t) {
              v && (v = v[t]),
              h && (h = h[t])
          }
          )),
          null == v ? void 0 : v[p]) {
              if (v = v[p],
              "direct" === c)
                  return v;
              if (v[c])
                  return v[c]
          }
          if (h)
              return "direct" === c || "value" === c ? h[p] : null === (a = f(h, p)) || void 0 === a ? void 0 : a[c]
      }
      var bt = new it
        , Ot = !1
        , Et = null
        , St = [];
      function At(t) {
          Ot ? t() : Et ? t(Et) : St.push(t)
      }
      function Ct() {
          var t = St;
          St = [],
          et(t, (function(t) {
              t(Et)
          }
          ))
      }
      function _t(t, e) {
          if (Z(t, e))
              return t[e]
      }
      function jt(t, e, n) {
          G(t, e, {
              value: n,
              writable: !0,
              enumerable: !0,
              configurable: !0
          })
      }
      lt(bt, "load", (function() {
          Ot = !0,
          Q(Ct, 1)
      }
      )),
      lt(bt, "error", (function() {
          Et = new Error("Failed to load crossorigin image"),
          Q(Ct, 1)
      }
      )),
      at(bt, "https://wwcdn.weixin.qq.com/node/wework/images/1x1-00000000.91e42db1c6.png");
      var xt = "\ufeff"
        , kt = String.fromCharCode(8204)
        , Dt = String.fromCharCode(8205)
        , Tt = String.fromCharCode(8203)
        , Mt = [String.fromCharCode(8206), String.fromCharCode(8207), kt, Dt, Tt]
        , Rt = {}
        , Pt = 0;
      function Wt(t) {
          var e = _t(t, "encrypt_token");
          if (e)
              return e;
          var n = _t(t, "data")
            , r = _t(t, "encrypt_text_data");
          if (n && r) {
              for (var o = (Pt++).toString(5), i = "", a = 0, c = o.length; a < c; a++)
                  i += Mt[Number(o[a])];
              var u = xt + r + i + xt;
              return jt(Rt, u, n),
              jt(t, "encrypt_token", u),
              u
          }
      }
      function qt(t) {
          var e = rt(t, xt, 0);
          if (-1 === e)
              return t;
          for (var n = ot(t, 0, e); -1 !== e; ) {
              var r = rt(t, xt, e + 1);
              if (-1 === r)
                  break;
              var o = _t(Rt, ot(t, e, r + 1));
              o ? (n += o,
              e = r + 1) : (n += ot(t, e, r),
              e = r)
          }
          return n + ot(t, e)
      }
      var Ft = vt && new vt
        , It = !1
        , Nt = !1;
      function Lt(t) {
          ht(Ft, t) || (Nt || ft(t, bt, 0, 0),
          gt(Ft, t, !0))
      }
      var Ut = {};
      function zt(t, e, n) {
          return "".concat(t, "::").concat(e, "::").concat(n || "")
      }
      function Ht(t) {
          return zt(_t(t, "type"), _t(t, "id"), _t(t, "corpid"))
      }
      function Jt(t) {
          return _t(Ut, t)
      }
      var Bt = r()
        , Vt = 1
        , Xt = {}
        , Kt = {}
        , Yt = {};
      function $t(t, e) {
          if (!t)
              return L("[callback] missing response"),
              void Gt(e, new Error("missing response data"));
          var n = _t(t, "items");
          if (!n)
              return L("[callback] missing items"),
              void Gt(e, new Error("missing response items"));
          et(n, (function(t) {
              var e;
              e = Ht(t),
              jt(Ut, e, t)
          }
          ));
          var r = [];
          et(e, (function(t) {
              var e = Ht(t);
              if (Jt(e)) {
                  var n = _t(Xt, e);
                  n && (delete Xt[e],
                  et(n, (function(t) {
                      var e = _t(Kt, t);
                      if (e) {
                          var n = _t(Yt, t) - 1;
                          n > 0 ? jt(Yt, t, n) : (delete Yt[t],
                          delete Kt[t],
                          e())
                      }
                  }
                  )))
              } else
                  tt(r, t)
          }
          )),
          r.length > 0 && Gt(r, new Error("missing items"))
      }
      function Gt(t, e) {
          et(t, (function(t) {
              var n = Ht(t)
                , r = _t(Xt, n);
              r && (delete Xt[n],
              et(r, (function(t) {
                  var n = _t(Kt, t);
                  delete Yt[t],
                  delete Kt[t],
                  n && n(e)
              }
              )))
          }
          ))
      }
      function Qt(t) {
          for (var e = mt(B, "JSON.parse"), n = mt(V, "Uint8Array", "direct"), r = mt(B, "String.fromCodePoint"), o = r, i = new n(t), a = "", c = 0, u = i.length; c < u; ) {
              var l = i[c++];
              if (l <= 127)
                  a += o(l);
              else {
                  var s = 63 & i[c++];
                  if (l <= 223)
                      a += o((31 & l) << 6 | s);
                  else {
                      var f = 63 & i[c++];
                      if (l <= 239)
                          a += o((15 & l) << 12 | s << 6 | f);
                      else {
                          var d = 63 & i[c++];
                          r ? a += o((7 & l) << 18 | s << 12 | f << 6 | d) : (a += o(63),
                          c += 3)
                      }
                  }
              }
          }
          return e(a)
      }
      var Zt, te, ee, ne = {
          skey: null
      }, re = (null === (Zt = window.crypto) || void 0 === Zt ? void 0 : Zt.subtle) || (null === (te = window.crypto) || void 0 === te ? void 0 : te.webkitSubtle);
      function oe() {
          return ee || (ee = re.importKey("raw", function(t) {
              for (var e = mt(V, "Uint8Array", "direct"), n = mt(V, "parseInt", "direct"), r = $(mt(B, "String.prototype.substring")), o = new e(t.length / 2), i = 0, a = t.length; i < a; i += 2)
                  o[i / 2] = n(r(t, i, i + 2), 16);
              return o
          }(c), "AES-CBC", !1, ["decrypt"]))
      }
      function ie(t, e, n, r) {
          ae(t, e, n, r, !1)
      }
      function ae(t, e, n, r) {
          var o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
          if (window.fetch)
              window.fetch(t, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify(e)
              }).then((function(t) {
                  if (200 === t.status)
                      return o ? t.arrayBuffer() : t.json();
                  var e = "Invalid response status ".concat(t.status);
                  return t.json().catch((function() {
                      throw new Error(e)
                  }
                  )).then((function(t) {
                      throw (null == t ? void 0 : t.result) ? null == t ? void 0 : t.result : new Error(e)
                  }
                  ))
              }
              )).then(n, r);
          else {
              var i = new XMLHttpRequest;
              i.open("POST", t),
              i.withCredentials = !0,
              o && (i.responseType = "arraybuffer"),
              i.setRequestHeader("Content-Type", "application/json"),
              i.onreadystatechange = function() {
                  if (i.readyState === XMLHttpRequest.DONE)
                      if (200 === i.status)
                          if (o)
                              n(i.response);
                          else
                              try {
                                  n(JSON.parse(i.responseText))
                              } catch (t) {
                                  r(new Error("Parse response error"))
                              }
                      else
                          r(new Error("Invalid response status ".concat(i.status)))
              }
              ,
              i.onerror = function() {
                  r(new Error("Request error"))
              }
              ,
              i.send(JSON.stringify(e))
          }
      }
      function ce(t) {
          var e = function(e) {
              L("[fetchData] fetch fail #".concat(n, " (").concat(n, ")"), e),
              Gt(t, {
                  errMsg: "wwapp.fetchOpenData:fail",
                  rand: n,
                  detail: e
              })
          };
          if (!c)
              return L("[fetchData] missing referer"),
              void Gt(t, {
                  errMsg: "wwapp.fetchOpenData:fail",
                  hint: "Missing referer for jwxwork.js. See: https://developer.work.weixin.qq.com/document/path/91958"
              });
          var n = r()
            , o = "".concat(d, "/wwopen/openData/getOpenData?f=json&r=").concat(n);
          I("[fetchData] begin #".concat(n));
          var i = oe();
          !function(t, e, n, r) {
              ae(t, e, n, r, !0)
          }(o, {
              items: t,
              skey: ne.skey,
              sid: u
          }, (function(r) {
              I("[fetchData] fetch res #".concat(n)),
              i.then((function(t) {
                  return re.decrypt({
                      name: "AES-CBC",
                      iv: new Uint8Array(16)
                  }, t, r)
              }
              )).then(Qt).then((function(e) {
                  I("[fetchData] fetch parsed #".concat(n)),
                  $t(e, t)
              }
              )).catch(e)
          }
          ), e)
      }
      r();
      var ue, le = [];
      function se(t, e) {
          var n = function(t, e) {
              var n = "".concat(Bt, ".").concat(Vt++)
                , r = []
                , o = {}
                , i = 0;
              if (et(t, (function(t) {
                  var e = _t(t, "type")
                    , a = _t(t, "id");
                  if (e && a) {
                      var c = zt(e, a, _t(t, "corpid"));
                      Jt(c) || Z(o, c) || (jt(o, c, !0),
                      i += 1,
                      Z(Xt, c) ? tt(_t(Xt, c), n) : (jt(Xt, c, [n]),
                      tt(r, t)))
                  }
              }
              )),
              i)
                  return jt(Yt, n, i),
                  jt(Kt, n, e),
                  r;
              e()
          }(t, e);
          n && (et(n, (function(t) {
              tt(le, t)
          }
          )),
          !ue && le.length && (ue = Q(C("flush-fetch", fe), 20)))
      }
      function fe() {
          var t = le;
          ue = void 0,
          le = [];
          for (var e = t.length, n = 0; n < e; n += 1e3) {
              ce(nt(t, n, n + 1e3))
          }
      }
      function de(t, e) {
          var n = null;
          try {
              n = ut(t)
          } catch (t) {}
          if (null !== n)
              throw new Error("Missing cross origin");
          ct(t).postMessage(e, d)
      }
      var pe;
      !function(t) {
          t[t.loading = 1] = "loading",
          t[t.ready = 2] = "ready",
          t[t.error = 3] = "error"
      }(pe || (pe = {}));
      var ve = function() {
          function t() {
              var e = this;
              !function(t, e) {
                  if (!(t instanceof e))
                      throw new TypeError("Cannot call a class as a function")
              }(this, t),
              this.iframe = document.createElement("iframe"),
              this.state = pe.loading,
              this.queue = [],
              this.iframe.onload = C("MainFrame.onload", (function() {
                  I("[MainFrame] onload"),
                  e.state = pe.ready,
                  e.fetchData()
              }
              )),
              this.iframe.onerror = function(t) {
                  k((null == t ? void 0 : t.error) || new Error("MainFrame load error"), "MainFrame.onerror"),
                  e.state = pe.error
              }
              ,
              this.iframe.style.display = "none",
              this.iframe.referrerPolicy = "origin",
              this.iframe.src = p
          }
          var e = t.prototype;
          return e.enqueueFetch = function(t) {
              var e = this;
              this.queue.push(t),
              this.timer || (this.timer = Q(C("MainFrame.timeout", (function() {
                  e.state === pe.ready && e.fetchData()
              }
              )), 20))
          }
          ,
          e.fetchData = function() {
              var t = {}
                , e = [];
              this.queue.forEach((function(n) {
                  var r = "".concat(n.type, "::").concat(n.id, "::").concat(n.corpid || "");
                  t[r] || (t[r] = !0,
                  e.push(n))
              }
              )),
              e.length && (this.timer = void 0,
              this.queue = [],
              I("[MainFrame] fetchData"),
              de(this.iframe, JSON.stringify({
                  type: "fetch",
                  items: e,
                  skey: ne.skey,
                  sid: u
              })))
          }
          ,
          t
      }();
      var he, ge, we = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant", "fontStretch", "fontSizeAdjust", "color", "cursor"];
      !function(t) {
          t[t.pending = 1] = "pending",
          t[t.ready = 2] = "ready",
          t[t.error = 3] = "error",
          t[t.loading = 4] = "loading"
      }(he || (he = {})),
      function(t) {
          t[t.empty = 1] = "empty",
          t[t.frame = 2] = "frame"
      }(ge || (ge = {}));
      var ye = function() {
          function t(e, n) {
              !function(t, e) {
                  if (!(t instanceof e))
                      throw new TypeError("Cannot call a class as a function")
              }(this, t),
              this.container = e,
              this.mainFrame = n,
              this.renderType = ge.empty,
              this.loadState = he.pending
          }
          var n = t.prototype;
          return n.update = function() {
              var t = this.getItem();
              if (!t.type || !t.id)
                  return this.renderEmpty();
              this.renderText(t)
          }
          ,
          n.renderEmpty = function() {
              this.setChild(ge.empty)
          }
          ,
          n.renderText = function(t) {
              var n = this;
              if (this.renderType !== ge.frame || this.loadState === he.error) {
                  var r = document.createElement("iframe");
                  r.onload = C("Frame.onload", (function() {
                      n.renderEl === r && (n.loadState = he.ready,
                      n.notifyUpdate())
                  }
                  )),
                  r.onerror = function(t) {
                      n.renderEl === r && (k((null == t ? void 0 : t.error) || new Error("Frame load error"), "Frame.onerror"),
                      n.loadState = he.error)
                  }
                  ;
                  var o = e("".concat(t.type, "::").concat(t.id, "::").concat(t.corpid || ""));
                  r.frameBorder = "0",
                  r.referrerPolicy = "origin",
                  r.src = "".concat(p, "&init=").concat(o),
                  this.loadState = he.loading,
                  this.setChild(ge.frame, r)
              }
              this.mainFrame.enqueueFetch(t),
              this.loadState === he.ready && this.notifyUpdate(t)
          }
          ,
          n.setChild = function(t, e) {
              for (var n = this.container; n.firstChild; )
                  n.removeChild(n.firstChild);
              e && n.appendChild(e),
              this.renderEl = e,
              this.renderType = t
          }
          ,
          n.getItem = function() {
              return {
                  type: this.container.getAttribute("type"),
                  id: this.container.getAttribute("openid"),
                  corpid: this.container.getAttribute("corpid") || void 0
              }
          }
          ,
          n.notifyUpdate = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.getItem();
              if (t.type && t.id) {
                  var e = {}
                    , n = getComputedStyle(this.container);
                  we.forEach((function(t) {
                      e[t] = n[t]
                  }
                  )),
                  de(this.renderEl, JSON.stringify({
                      type: "update",
                      item: t,
                      style: e
                  }))
              }
          }
          ,
          t
      }()
        , me = {
          "ww.opendata.event": function(t, e) {
              var n;
              "click" === t.eventType && (null === (n = e.parentNode) || void 0 === n || n.click())
          },
          "ww.opendata.resize": function(t, e) {
              var n = t.size;
              e.style.width = n.width,
              e.style.height = n.height,
              S("update", {
                  el: e.parentNode,
                  hasData: !!n.width
              })
          }
      };
      function be(t) {
          if (t.origin === d) {
              var e;
              try {
                  e = JSON.parse(t.data)
              } catch (t) {}
              e && me[e.type] && et(document.querySelectorAll("ww-open-data iframe"), (function(n) {
                  n.contentWindow === t.source && me[e.type](e, n)
              }
              ))
          }
      }
      var Oe, Ee, Se = "__WW_OPENDATA_RENDER__";
      function Ae(t) {
          if (t) {
              var e = t;
              e[Se] || (e[Se] = new ye(t,Oe)),
              e[Se].update()
          }
      }
      var Ce = vt && new vt;
      function _e(t) {
          var e = ht(Ce, t);
          if (e)
              return e;
          try {
              var n = wt(t, {
                  mode: "closed"
              });
              return gt(Ce, t, n),
              n
          } catch (e) {
              L("[getShadow] fail", t, e)
          }
      }
      function je(t) {
          if (!xe(t, !0)) {
              ne.skey || (S("error", {
                  errMsg: "bind:fail",
                  message: "missing agentConfig",
                  element: t
              }),
              console.error("[ww-open-data] 页面未完成 wx.agentConfig，请先完成 wx.agentConfig 再调用 WWOpenData.bind，后续将逐步下线未完成 wx.agentConfig 时调用 WWOpenData.bind 的支持"));
              var e = r();
              se([{
                  type: t.getAttribute("type"),
                  id: t.getAttribute("openid"),
                  corpid: t.getAttribute("corpid")
              }], C("bind-pending", (function(n) {
                  if (n)
                      return L("[bind] fetch error", e, n),
                      void S("error", {
                          errMsg: "bind:fail",
                          message: "fetch open-data fail",
                          detail: n
                      });
                  xe(t)
              }
              )))
          }
      }
      function xe(t) {
          var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          if (!(null == t ? void 0 : t.getAttribute))
              return S("error", {
                  errMsg: "bind:fail",
                  message: "missing bind element",
                  element: t
              }),
              !1;
          var n = t.getAttribute("type");
          if (!n)
              return S("error", {
                  errMsg: "bind:fail",
                  message: "missing open-data type",
                  element: t
              }),
              !1;
          var r = t.getAttribute("openid");
          if (!r)
              return S("error", {
                  errMsg: "bind:fail",
                  message: "missing open-data openid",
                  element: t
              }),
              !1;
          var o = t.getAttribute("corpid")
            , i = _e(t);
          if (!i)
              return S("error", {
                  errMsg: "bind:fail",
                  message: "attach shadow fail",
                  element: t
              }),
              !1;
          var a = Jt(zt(n, r, o));
          if (!a)
              return e || S("error", {
                  errMsg: "bind:fail",
                  message: "missing open-data item",
                  element: t
              }),
              !1;
          var c = _t(a, "data");
          return yt(i, c || ""),
          S("update", {
              element: t,
              hasData: !!c
          }),
          !!c
      }
      var ke = 0;
      wt || (ke |= 1),
      re || (ke |= 2),
      "http:" === document.location.protocol && (ke |= 4);
      var De, Te = 0, Me = navigator.userAgent;
      if (!(/miniProgram/i.test(Me) || "miniprogram" === window.__wxjs_environment))
          /wxwork/i.test(Me) && (Te |= 4),
          window.WeixinSandBox && (Te |= 1),
          (null === (De = window.wx) || void 0 === De ? void 0 : De.agentConfig) && (Te |= 2);
      var Re = C("bind", ke ? Ae : je)
        , Pe = C("bindAll", ke ? function(t) {
          et(t, Ae)
      }
      : function(t) {
          F("[bindAll] begin", t),
          et(t, je),
          F("[bindAll] end")
      }
      );
      function We() {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          if (!(t.corpid && t.agentid && t.timestamp && t.nonceStr && t.signature && t.jsApiList)) {
              var e, n, r = {
                  err_Info: "fail",
                  errMsg: "agentConfig:fail",
                  hint: "Missing params"
              };
              return null === (e = t.fail) || void 0 === e || e.call(t, r),
              void (null === (n = t.complete) || void 0 === n || n.call(t, r))
          }
          var o = {
              corpid: "".concat(t.corpid),
              agentid: "".concat(t.agentid),
              timestamp: "".concat(t.timestamp),
              nonceStr: "".concat(t.nonceStr),
              signature: "".concat(t.signature),
              jsApiList: t.jsApiList,
              url: location.href
          };
          qe("agentConfig", {
              config: o,
              sid: u
          }, t, (function(t) {
              var e;
              ne.skey = null === (e = t.data) || void 0 === e ? void 0 : e.skey,
              Pe(document.querySelectorAll("ww-open-data")),
              I("[user config] #".concat(JSON.stringify(o)))
          }
          ))
      }
      function qe(t, e) {
          var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
            , o = arguments.length > 3 ? arguments[3] : void 0
            , i = r();
          I("[invoke] ".concat(t, " begin #").concat(i)),
          ie("".concat(d, "/wwopen/openData/").concat(t, "?f=json&r=").concat(i), e, (function(e) {
              var r, a, c, u, l = (null === (r = e.data) || void 0 === r ? void 0 : r.result) || e.data || {
                  errMsg: "".concat(t, ":fail")
              };
              l.errMsg === "".concat(t, ":ok") ? (F("[invoke] ".concat(t, " succ #").concat(i)),
              null == o || o(e),
              null === (c = n.success) || void 0 === c || c.call(n, l)) : (L("[invoke] ".concat(t, " fail #").concat(i), e),
              null === (u = n.fail) || void 0 === u || u.call(n, l));
              null === (a = n.complete) || void 0 === a || a.call(n, l)
          }
          ), (function(e) {
              var r, o;
              L("[invoke] ".concat(t, " fail #").concat(i), e);
              var a = {
                  errMsg: "".concat(t, ":fail")
              };
              null === (r = n.fail) || void 0 === r || r.call(n, a),
              null === (o = n.complete) || void 0 === o || o.call(n, a)
          }
          ))
      }
      function Fe(t) {
          if (void 0 === t)
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return t
      }
      function Ie() {
          if ("undefined" == typeof Reflect || !Reflect.construct)
              return !1;
          if (Reflect.construct.sham)
              return !1;
          if ("function" == typeof Proxy)
              return !0;
          try {
              return Date.prototype.toString.call(Reflect.construct(Date, [], (function() {}
              ))),
              !0
          } catch (t) {
              return !1
          }
      }
      function Ne(t, e, n) {
          return Ne = Ie() ? Reflect.construct : function(t, e, n) {
              var r = [null];
              r.push.apply(r, e);
              var o = new (Function.bind.apply(t, r));
              return n && He(o, n.prototype),
              o
          }
          ,
          Ne.apply(null, arguments)
      }
      function Le(t, e) {
          for (var n = 0; n < e.length; n++) {
              var r = e[n];
              r.enumerable = r.enumerable || !1,
              r.configurable = !0,
              "value"in r && (r.writable = !0),
              Object.defineProperty(t, r.key, r)
          }
      }
      function Ue(t) {
          return Ue = Object.setPrototypeOf ? Object.getPrototypeOf : function(t) {
              return t.__proto__ || Object.getPrototypeOf(t)
          }
          ,
          Ue(t)
      }
      function ze(t, e) {
          return !e || "object" !== Je(e) && "function" != typeof e ? Fe(t) : e
      }
      function He(t, e) {
          return He = Object.setPrototypeOf || function(t, e) {
              return t.__proto__ = e,
              t
          }
          ,
          He(t, e)
      }
      var Je = function(t) {
          return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t
      };
      function Be(t) {
          var e = void 0;
          return Be = function(t) {
              if (null === t || (n = t,
              -1 === Function.toString.call(n).indexOf("[native code]")))
                  return t;
              var n;
              if ("function" != typeof t)
                  throw new TypeError("Super expression must either be null or a function");
              if (void 0 !== e) {
                  if (e.has(t))
                      return e.get(t);
                  e.set(t, r)
              }
              function r() {
                  return Ne(t, arguments, Ue(this).constructor)
              }
              return r.prototype = Object.create(t.prototype, {
                  constructor: {
                      value: r,
                      enumerable: !1,
                      writable: !0,
                      configurable: !0
                  }
              }),
              He(r, t)
          }
          ,
          Be(t)
      }
      function Ve(t) {
          var e = function() {
              if ("undefined" == typeof Reflect || !Reflect.construct)
                  return !1;
              if (Reflect.construct.sham)
                  return !1;
              if ("function" == typeof Proxy)
                  return !0;
              try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {}
                  ))),
                  !0
              } catch (t) {
                  return !1
              }
          }();
          return function() {
              var n, r = Ue(t);
              if (e) {
                  var o = Ue(this).constructor;
                  n = Reflect.construct(r, arguments, o)
              } else
                  n = r.apply(this, arguments);
              return ze(this, n)
          }
      }
      if (Te)
          N("skip inject", Te);
      else {
          if (ke ? (N("inject iframe", ke),
          function() {
              window.addEventListener ? window.addEventListener("message", C("dispatchMessage", be)) : window.attachEvent("onmessage", C("dispatchMessage", be));
              var t = document.querySelector("head");
              Ee = document.createElement("style"),
              t.appendChild(Ee),
              Oe = new ve,
              t.appendChild(Oe.iframe);
              var e = Ee.sheet;
              e.insertRule("ww-open-data { display: inline-block; vertical-align: text-bottom; overflow: hidden }", 0),
              e.insertRule("ww-open-data img { display: block; width: 100%; height: 100% }", 1),
              e.insertRule("ww-open-data iframe { display: block; width: 0; height: 0 }", 2)
          }()) : I("inject begin", ke),
          c || function() {
              for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++)
                  e[n] = arguments[n];
              var r, o;
              (r = console).error.apply(r, [q].concat(W(e))),
              (o = R).error.apply(o, W(e))
          }("Missing referer for jwxwork.js. See: https://work.weixin.qq.com/api/doc/90001/90143/91958"),
          window.wx ? window.wx.agentConfig || I("define wx.agentConfig") : N("missing window.wx"),
          window.wx || (window.wx = {}),
          window.wx.agentConfig || G(window.wx, "agentConfig", {
              value: C("agentConfig", We)
          }),
          window.WWOpenData)
              L("window.WWOpenData already exists");
          else {
              var Xe = {};
              Ke(Xe, "bindAll", Pe),
              Ke(Xe, "bind", Re),
              Ke(Xe, "on", O),
              Ke(Xe, "once", (function(t, e) {
                  O(t, (function t(n) {
                      E("name", t),
                      e(n)
                  }
                  ))
              }
              )),
              Ke(Xe, "off", E),
              Ke(Xe, "checkSession", (function() {
                  var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                  qe("checkSession", {
                      sid: u
                  }, t)
              }
              )),
              Ke(Xe, "initCanvas", (function() {
                  var t;
                  if (It)
                      return !0;
                  var e = null === (t = window.CanvasRenderingContext2D) || void 0 === t ? void 0 : t.prototype;
                  return !!e && (e.strokeText = function(t, e, n, r) {
                      if (!Ot)
                          return null == r ? dt(this, t, e, n) : dt(this, t, e, n, r);
                      var o = qt(t);
                      return o !== t && Lt(this),
                      null == r ? dt(this, o, e, n) : dt(this, o, e, n, r)
                  }
                  ,
                  e.fillText = function(t, e, n, r) {
                      if (!Ot)
                          return null == r ? st(this, t, e, n) : st(this, t, e, n, r);
                      var o = qt(t);
                      return o !== t && Lt(this),
                      null == r ? st(this, o, e, n) : st(this, o, e, n, r)
                  }
                  ,
                  e.measureText = function(t) {
                      return pt(this, Ot ? qt(t) : t)
                  }
                  ,
                  It = !0,
                  !0)
              }
              )),
              Ke(Xe, "enableCanvasSharing", (function() {
                  N("enable canvas sharing"),
                  Nt = !0
              }
              )),
              Ke(Xe, "disableCanvasSharing", (function() {
                  Nt = !1
              }
              )),
              Ke(Xe, "prefetch", (function(t, e) {
                  var n = t.items;
                  se(n, (function(t) {
                      if (t)
                          return e(t);
                      var r = [];
                      et(n, (function(t) {
                          var e = Jt(Ht(t));
                          e && 1 === _t(e, "datakind") && r.push({
                              type: t.type,
                              id: t.id,
                              corpid: t.corpid,
                              data: Wt(e)
                          })
                      }
                      )),
                      At((function(t) {
                          t ? e(t) : e(null, {
                              items: r
                          })
                      }
                      ))
                  }
                  ))
              }
              )),
              G(Xe, "__version__", {
                  value: s
              }),
              Ke(Xe, "agentConfig", C("agentConfig", We)),
              Ke(window, "WWOpenData", Xe),
              I("window.WWOpenData defined", window.WWOpenData)
          }
          "customElements"in window && !customElements.get("ww-open-data") && function() {
              try {
                  I("register custom element");
                  var t = function(t) {
                      t._current = {
                          type: t.getAttribute("type"),
                          id: t.getAttribute("openid"),
                          corpid: t.getAttribute("corpid")
                      },
                      ne.skey && Re(t)
                  }
                    , e = function(e) {
                      !function(t, e) {
                          if ("function" != typeof e && null !== e)
                              throw new TypeError("Super expression must either be null or a function");
                          t.prototype = Object.create(e && e.prototype, {
                              constructor: {
                                  value: t,
                                  writable: !0,
                                  configurable: !0
                              }
                          }),
                          e && He(t, e)
                      }(a, e);
                      var n, r, o, i = Ve(a);
                      function a() {
                          var e;
                          return function(t, e) {
                              if (!(t instanceof e))
                                  throw new TypeError("Cannot call a class as a function")
                          }(this, a),
                          (e = i.call(this))._current = {},
                          e.getAttribute("type") && e.getAttribute("openid") ? (t(Fe(e)),
                          e) : ze(e)
                      }
                      return a.prototype.attributeChangedCallback = function() {
                          this._current.type === this.getAttribute("type") && this._current.id === this.getAttribute("openid") && this._current.corpid === this.getAttribute("corpid") || t(this)
                      }
                      ,
                      n = a,
                      o = [{
                          key: "observedAttributes",
                          get: function() {
                              return ["type", "openid", "corpid"]
                          }
                      }],
                      (r = null) && Le(n.prototype, r),
                      o && Le(n, o),
                      a
                  }(Be(HTMLElement));
                  customElements.define("ww-open-data", e)
              } catch (t) {
                  k(t, "register custom element")
              }
          }()
      }
      function Ke(t, e, n) {
          G(t, e, {
              value: n,
              enumerable: !0
          })
      }
  } catch (Et) {
      t.captureException(Et, "?")
  }
}();
