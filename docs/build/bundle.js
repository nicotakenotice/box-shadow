
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Header.svelte generated by Svelte v3.38.3 */

    const file$2 = "src\\components\\Header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let div3;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let a;
    	let i1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div3 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "box-shadow";
    			t2 = space();
    			div2 = element("div");
    			a = element("a");
    			i1 = element("i");
    			attr_dev(i0, "class", "bi bi-back");
    			add_location(i0, file$2, 2, 9, 118);
    			add_location(div0, file$2, 2, 4, 113);
    			attr_dev(div1, "class", "ellipsis ms-2");
    			add_location(div1, file$2, 3, 4, 156);
    			attr_dev(i1, "class", "bi bi-github");
    			add_location(i1, file$2, 5, 77, 305);
    			attr_dev(a, "href", "https://github.com/nicotakenotice/box-shadow");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 5, 6, 234);
    			attr_dev(div2, "class", "ms-auto");
    			add_location(div2, file$2, 4, 4, 205);
    			attr_dev(div3, "class", "container-fluid d-flex flex-row align-items-center py-3");
    			add_location(div3, file$2, 1, 2, 38);
    			attr_dev(header, "class", "sticky-top shadow svelte-120ct91");
    			add_location(header, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div3);
    			append_dev(div3, div0);
    			append_dev(div0, i0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, i1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.38.3 */

    const file$1 = "src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let t0;
    	let t1;
    	let t2;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			t0 = text("© ");
    			t1 = text(/*currentYear*/ ctx[0]);
    			t2 = space();
    			a = element("a");
    			a.textContent = "@nicotakenotice";
    			attr_dev(a, "href", "https://github.com/nicotakenotice");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 5, 23, 138);
    			attr_dev(footer, "class", "text-center bg-gray py-3");
    			add_location(footer, file$1, 4, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, t0);
    			append_dev(footer, t1);
    			append_dev(footer, t2);
    			append_dev(footer, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const currentYear = new Date().getFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ currentYear });
    	return [currentYear];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div49;
    	let header;
    	let t0;
    	let main;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let input0;
    	let t2;
    	let span0;
    	let t4;
    	let div48;
    	let div45;
    	let div8;
    	let div6;
    	let div3;
    	let t6;
    	let div4;
    	let t7;
    	let t8;
    	let div5;
    	let i0;
    	let t9;
    	let div7;
    	let input1;
    	let t10;
    	let div14;
    	let div12;
    	let div9;
    	let t12;
    	let div10;
    	let t13;
    	let t14;
    	let div11;
    	let i1;
    	let t15;
    	let div13;
    	let input2;
    	let t16;
    	let div20;
    	let div18;
    	let div15;
    	let t18;
    	let div16;
    	let t19;
    	let t20;
    	let div17;
    	let i2;
    	let t21;
    	let div19;
    	let input3;
    	let t22;
    	let div26;
    	let div24;
    	let div21;
    	let t24;
    	let div22;
    	let t25;
    	let t26;
    	let div23;
    	let i3;
    	let t27;
    	let div25;
    	let input4;
    	let t28;
    	let div32;
    	let div30;
    	let div27;
    	let t30;
    	let div28;
    	let t31;
    	let t32;
    	let div29;
    	let i4;
    	let t33;
    	let div31;
    	let input5;
    	let t34;
    	let div38;
    	let div36;
    	let div33;
    	let t36;
    	let div34;
    	let t37;
    	let t38;
    	let div35;
    	let i5;
    	let t39;
    	let div37;
    	let input6;
    	let t40;
    	let div44;
    	let div42;
    	let div39;
    	let t42;
    	let div40;
    	let t43;
    	let t44;
    	let div41;
    	let i6;
    	let t45;
    	let div43;
    	let input7;
    	let t46;
    	let div47;
    	let pre;
    	let t47;
    	let span1;
    	let t49;
    	let span2;
    	let t50;
    	let t51;
    	let span3;
    	let t53;
    	let span4;
    	let t54;
    	let t55;
    	let t56;
    	let div46;
    	let i7;
    	let t57;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div49 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "inset";
    			t4 = space();
    			div48 = element("div");
    			div45 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			div3 = element("div");
    			div3.textContent = "x-offset";
    			t6 = space();
    			div4 = element("div");
    			t7 = text(/*shadowX*/ ctx[1]);
    			t8 = space();
    			div5 = element("div");
    			i0 = element("i");
    			t9 = space();
    			div7 = element("div");
    			input1 = element("input");
    			t10 = space();
    			div14 = element("div");
    			div12 = element("div");
    			div9 = element("div");
    			div9.textContent = "y-offset";
    			t12 = space();
    			div10 = element("div");
    			t13 = text(/*shadowY*/ ctx[2]);
    			t14 = space();
    			div11 = element("div");
    			i1 = element("i");
    			t15 = space();
    			div13 = element("div");
    			input2 = element("input");
    			t16 = space();
    			div20 = element("div");
    			div18 = element("div");
    			div15 = element("div");
    			div15.textContent = "blur";
    			t18 = space();
    			div16 = element("div");
    			t19 = text(/*shadowBlur*/ ctx[3]);
    			t20 = space();
    			div17 = element("div");
    			i2 = element("i");
    			t21 = space();
    			div19 = element("div");
    			input3 = element("input");
    			t22 = space();
    			div26 = element("div");
    			div24 = element("div");
    			div21 = element("div");
    			div21.textContent = "spread";
    			t24 = space();
    			div22 = element("div");
    			t25 = text(/*shadowSpread*/ ctx[4]);
    			t26 = space();
    			div23 = element("div");
    			i3 = element("i");
    			t27 = space();
    			div25 = element("div");
    			input4 = element("input");
    			t28 = space();
    			div32 = element("div");
    			div30 = element("div");
    			div27 = element("div");
    			div27.textContent = "shadow";
    			t30 = space();
    			div28 = element("div");
    			t31 = text(/*shadowColor*/ ctx[5]);
    			t32 = space();
    			div29 = element("div");
    			i4 = element("i");
    			t33 = space();
    			div31 = element("div");
    			input5 = element("input");
    			t34 = space();
    			div38 = element("div");
    			div36 = element("div");
    			div33 = element("div");
    			div33.textContent = "box";
    			t36 = space();
    			div34 = element("div");
    			t37 = text(/*boxColor*/ ctx[6]);
    			t38 = space();
    			div35 = element("div");
    			i5 = element("i");
    			t39 = space();
    			div37 = element("div");
    			input6 = element("input");
    			t40 = space();
    			div44 = element("div");
    			div42 = element("div");
    			div39 = element("div");
    			div39.textContent = "background";
    			t42 = space();
    			div40 = element("div");
    			t43 = text(/*bgColor*/ ctx[7]);
    			t44 = space();
    			div41 = element("div");
    			i6 = element("i");
    			t45 = space();
    			div43 = element("div");
    			input7 = element("input");
    			t46 = space();
    			div47 = element("div");
    			pre = element("pre");
    			t47 = text("#box {\r\n  ");
    			span1 = element("span");
    			span1.textContent = "background-color";
    			t49 = text(": ");
    			span2 = element("span");
    			t50 = text(/*boxColor*/ ctx[6]);
    			t51 = text(";\r\n  ");
    			span3 = element("span");
    			span3.textContent = "box-shadow";
    			t53 = text(": ");
    			span4 = element("span");
    			t54 = text(/*boxShadow*/ ctx[8]);
    			t55 = text(";\r\n}");
    			t56 = space();
    			div46 = element("div");
    			i7 = element("i");
    			t57 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "id", "box");
    			attr_dev(div0, "class", "rounded svelte-1g0kd26");
    			set_style(div0, "background-color", /*boxColor*/ ctx[6]);
    			set_style(div0, "box-shadow", /*boxShadow*/ ctx[8]);
    			add_location(div0, file, 38, 6, 1183);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "form-check-input");
    			add_location(input0, file, 45, 8, 1358);
    			attr_dev(span0, "class", "label svelte-1g0kd26");
    			add_location(span0, file, 46, 8, 1445);
    			attr_dev(div1, "id", "inset-box");
    			attr_dev(div1, "class", "svelte-1g0kd26");
    			add_location(div1, file, 44, 6, 1328);
    			attr_dev(div2, "id", "canvas");
    			attr_dev(div2, "class", "position-relative shadow svelte-1g0kd26");
    			set_style(div2, "background-color", /*bgColor*/ ctx[7]);
    			add_location(div2, file, 37, 4, 1089);
    			attr_dev(div3, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div3, file, 55, 12, 1709);
    			attr_dev(div4, "class", "number-box ms-auto svelte-1g0kd26");
    			add_location(div4, file, 56, 12, 1765);
    			attr_dev(i0, "class", "bi bi-arrow-counterclockwise");
    			add_location(i0, file, 58, 14, 1936);
    			attr_dev(div5, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div5, "title", "Reset");
    			add_location(div5, file, 57, 12, 1826);
    			attr_dev(div6, "class", "d-flex flex-row align-items-center");
    			add_location(div6, file, 54, 10, 1647);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "class", "form-range");
    			attr_dev(input1, "min", "-50");
    			attr_dev(input1, "max", "50");
    			add_location(input1, file, 61, 15, 2035);
    			add_location(div7, file, 61, 10, 2030);
    			attr_dev(div8, "class", "col-6 col-md-3");
    			add_location(div8, file, 53, 8, 1607);
    			attr_dev(div9, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div9, file, 67, 12, 2279);
    			attr_dev(div10, "class", "number-box ms-auto svelte-1g0kd26");
    			add_location(div10, file, 68, 12, 2335);
    			attr_dev(i1, "class", "bi bi-arrow-counterclockwise");
    			add_location(i1, file, 70, 14, 2506);
    			attr_dev(div11, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div11, "title", "Reset");
    			add_location(div11, file, 69, 12, 2396);
    			attr_dev(div12, "class", "d-flex flex-row align-items-center");
    			add_location(div12, file, 66, 10, 2217);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "class", "form-range");
    			attr_dev(input2, "min", "-50");
    			attr_dev(input2, "max", "50");
    			add_location(input2, file, 73, 15, 2605);
    			add_location(div13, file, 73, 10, 2600);
    			attr_dev(div14, "class", "col-6 col-md-3");
    			add_location(div14, file, 65, 8, 2177);
    			attr_dev(div15, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div15, file, 79, 12, 2845);
    			attr_dev(div16, "class", "number-box ms-auto svelte-1g0kd26");
    			add_location(div16, file, 80, 12, 2897);
    			attr_dev(i2, "class", "bi bi-arrow-counterclockwise");
    			add_location(i2, file, 82, 14, 3077);
    			attr_dev(div17, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div17, "title", "Reset");
    			add_location(div17, file, 81, 12, 2961);
    			attr_dev(div18, "class", "d-flex flex-row align-items-center");
    			add_location(div18, file, 78, 10, 2783);
    			attr_dev(input3, "type", "range");
    			attr_dev(input3, "class", "form-range");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "50");
    			add_location(input3, file, 85, 15, 3176);
    			add_location(div19, file, 85, 10, 3171);
    			attr_dev(div20, "class", "col-6 col-md-3");
    			add_location(div20, file, 77, 8, 2743);
    			attr_dev(div21, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div21, file, 91, 12, 3419);
    			attr_dev(div22, "class", "number-box ms-auto svelte-1g0kd26");
    			add_location(div22, file, 92, 12, 3473);
    			attr_dev(i3, "class", "bi bi-arrow-counterclockwise");
    			add_location(i3, file, 94, 14, 3659);
    			attr_dev(div23, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div23, "title", "Reset");
    			add_location(div23, file, 93, 12, 3539);
    			attr_dev(div24, "class", "d-flex flex-row align-items-center");
    			add_location(div24, file, 90, 10, 3357);
    			attr_dev(input4, "type", "range");
    			attr_dev(input4, "class", "form-range");
    			attr_dev(input4, "min", "-50");
    			attr_dev(input4, "max", "50");
    			add_location(input4, file, 97, 15, 3758);
    			add_location(div25, file, 97, 10, 3753);
    			attr_dev(div26, "class", "col-6 col-md-3");
    			add_location(div26, file, 89, 8, 3317);
    			attr_dev(div27, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div27, file, 103, 12, 4012);
    			attr_dev(div28, "class", "hex-box ms-auto svelte-1g0kd26");
    			add_location(div28, file, 104, 12, 4066);
    			attr_dev(i4, "class", "bi bi-arrow-counterclockwise");
    			add_location(i4, file, 106, 14, 4246);
    			attr_dev(div29, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div29, "title", "Reset");
    			add_location(div29, file, 105, 12, 4128);
    			attr_dev(div30, "class", "d-flex flex-row align-items-center");
    			add_location(div30, file, 102, 10, 3950);
    			attr_dev(input5, "type", "color");
    			attr_dev(input5, "class", "svelte-1g0kd26");
    			add_location(input5, file, 109, 28, 4358);
    			attr_dev(div31, "class", "mt-1");
    			add_location(div31, file, 109, 10, 4340);
    			attr_dev(div32, "class", "col-12 col-sm-4");
    			add_location(div32, file, 101, 8, 3909);
    			attr_dev(div33, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div33, file, 115, 12, 4570);
    			attr_dev(div34, "class", "hex-box ms-auto svelte-1g0kd26");
    			add_location(div34, file, 116, 12, 4621);
    			attr_dev(i5, "class", "bi bi-arrow-counterclockwise");
    			add_location(i5, file, 118, 14, 4792);
    			attr_dev(div35, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div35, "title", "Reset");
    			add_location(div35, file, 117, 12, 4680);
    			attr_dev(div36, "class", "d-flex flex-row align-items-center");
    			add_location(div36, file, 114, 10, 4508);
    			attr_dev(input6, "type", "color");
    			attr_dev(input6, "class", "svelte-1g0kd26");
    			add_location(input6, file, 121, 28, 4904);
    			attr_dev(div37, "class", "mt-1");
    			add_location(div37, file, 121, 10, 4886);
    			attr_dev(div38, "class", "col-12 col-sm-4");
    			add_location(div38, file, 113, 8, 4467);
    			attr_dev(div39, "class", "label ellipsis svelte-1g0kd26");
    			add_location(div39, file, 127, 12, 5120);
    			attr_dev(div40, "class", "hex-box ms-auto svelte-1g0kd26");
    			add_location(div40, file, 128, 12, 5178);
    			attr_dev(i6, "class", "bi bi-arrow-counterclockwise");
    			add_location(i6, file, 130, 14, 5346);
    			attr_dev(div41, "class", "reset-icon ms-2 svelte-1g0kd26");
    			attr_dev(div41, "title", "Reset");
    			add_location(div41, file, 129, 12, 5236);
    			attr_dev(div42, "class", "d-flex flex-row align-items-center");
    			add_location(div42, file, 126, 10, 5058);
    			attr_dev(input7, "type", "color");
    			attr_dev(input7, "class", "svelte-1g0kd26");
    			add_location(input7, file, 133, 28, 5458);
    			attr_dev(div43, "class", "mt-1");
    			add_location(div43, file, 133, 10, 5440);
    			attr_dev(div44, "class", "col-12 col-sm-4");
    			add_location(div44, file, 125, 8, 5017);
    			attr_dev(div45, "class", "row");
    			add_location(div45, file, 51, 6, 1553);
    			set_style(span1, "color", "var(--bs-purple)");
    			add_location(span1, file, 141, 2, 5682);
    			set_style(span2, "color", "var(--bs-green)");
    			add_location(span2, file, 141, 65, 5745);
    			set_style(span3, "color", "var(--bs-purple)");
    			add_location(span3, file, 142, 2, 5804);
    			set_style(span4, "color", "var(--bs-green)");
    			add_location(span4, file, 142, 59, 5861);
    			attr_dev(pre, "id", "css-box");
    			attr_dev(pre, "class", "mb-0");
    			add_location(pre, file, 139, 8, 5634);
    			attr_dev(i7, "class", "bi bi-clipboard");
    			add_location(i7, file, 147, 10, 6048);
    			attr_dev(div46, "id", "copy-icon");
    			attr_dev(div46, "title", "Copy to clipboard");
    			attr_dev(div46, "class", "svelte-1g0kd26");
    			add_location(div46, file, 146, 8, 5953);
    			attr_dev(div47, "class", "position-relative bg-gray rounded p-2 mt-4");
    			add_location(div47, file, 138, 6, 5568);
    			attr_dev(div48, "class", "container-fluid py-4");
    			add_location(div48, file, 50, 4, 1511);
    			attr_dev(main, "class", "flex-grow-1");
    			add_location(main, file, 35, 2, 1036);
    			attr_dev(div49, "class", "d-flex flex-column min-vh-100 font-monospace");
    			add_location(div49, file, 32, 0, 951);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div49, anchor);
    			mount_component(header, div49, null);
    			append_dev(div49, t0);
    			append_dev(div49, main);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			input0.checked = /*shadowInset*/ ctx[0];
    			append_dev(div1, t2);
    			append_dev(div1, span0);
    			append_dev(main, t4);
    			append_dev(main, div48);
    			append_dev(div48, div45);
    			append_dev(div45, div8);
    			append_dev(div8, div6);
    			append_dev(div6, div3);
    			append_dev(div6, t6);
    			append_dev(div6, div4);
    			append_dev(div4, t7);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, i0);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, input1);
    			set_input_value(input1, /*shadowX*/ ctx[1]);
    			append_dev(div45, t10);
    			append_dev(div45, div14);
    			append_dev(div14, div12);
    			append_dev(div12, div9);
    			append_dev(div12, t12);
    			append_dev(div12, div10);
    			append_dev(div10, t13);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, i1);
    			append_dev(div14, t15);
    			append_dev(div14, div13);
    			append_dev(div13, input2);
    			set_input_value(input2, /*shadowY*/ ctx[2]);
    			append_dev(div45, t16);
    			append_dev(div45, div20);
    			append_dev(div20, div18);
    			append_dev(div18, div15);
    			append_dev(div18, t18);
    			append_dev(div18, div16);
    			append_dev(div16, t19);
    			append_dev(div18, t20);
    			append_dev(div18, div17);
    			append_dev(div17, i2);
    			append_dev(div20, t21);
    			append_dev(div20, div19);
    			append_dev(div19, input3);
    			set_input_value(input3, /*shadowBlur*/ ctx[3]);
    			append_dev(div45, t22);
    			append_dev(div45, div26);
    			append_dev(div26, div24);
    			append_dev(div24, div21);
    			append_dev(div24, t24);
    			append_dev(div24, div22);
    			append_dev(div22, t25);
    			append_dev(div24, t26);
    			append_dev(div24, div23);
    			append_dev(div23, i3);
    			append_dev(div26, t27);
    			append_dev(div26, div25);
    			append_dev(div25, input4);
    			set_input_value(input4, /*shadowSpread*/ ctx[4]);
    			append_dev(div45, t28);
    			append_dev(div45, div32);
    			append_dev(div32, div30);
    			append_dev(div30, div27);
    			append_dev(div30, t30);
    			append_dev(div30, div28);
    			append_dev(div28, t31);
    			append_dev(div30, t32);
    			append_dev(div30, div29);
    			append_dev(div29, i4);
    			append_dev(div32, t33);
    			append_dev(div32, div31);
    			append_dev(div31, input5);
    			set_input_value(input5, /*shadowColor*/ ctx[5]);
    			append_dev(div45, t34);
    			append_dev(div45, div38);
    			append_dev(div38, div36);
    			append_dev(div36, div33);
    			append_dev(div36, t36);
    			append_dev(div36, div34);
    			append_dev(div34, t37);
    			append_dev(div36, t38);
    			append_dev(div36, div35);
    			append_dev(div35, i5);
    			append_dev(div38, t39);
    			append_dev(div38, div37);
    			append_dev(div37, input6);
    			set_input_value(input6, /*boxColor*/ ctx[6]);
    			append_dev(div45, t40);
    			append_dev(div45, div44);
    			append_dev(div44, div42);
    			append_dev(div42, div39);
    			append_dev(div42, t42);
    			append_dev(div42, div40);
    			append_dev(div40, t43);
    			append_dev(div42, t44);
    			append_dev(div42, div41);
    			append_dev(div41, i6);
    			append_dev(div44, t45);
    			append_dev(div44, div43);
    			append_dev(div43, input7);
    			set_input_value(input7, /*bgColor*/ ctx[7]);
    			append_dev(div48, t46);
    			append_dev(div48, div47);
    			append_dev(div47, pre);
    			append_dev(pre, t47);
    			append_dev(pre, span1);
    			append_dev(pre, t49);
    			append_dev(pre, span2);
    			append_dev(span2, t50);
    			append_dev(pre, t51);
    			append_dev(pre, span3);
    			append_dev(pre, t53);
    			append_dev(pre, span4);
    			append_dev(span4, t54);
    			append_dev(pre, t55);
    			append_dev(div47, t56);
    			append_dev(div47, div46);
    			append_dev(div46, i7);
    			append_dev(div49, t57);
    			mount_component(footer, div49, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[10]),
    					listen_dev(div5, "click", /*click_handler*/ ctx[11], false, false, false),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[12]),
    					listen_dev(div11, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[14]),
    					listen_dev(div17, "click", /*click_handler_2*/ ctx[15], false, false, false),
    					listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[16]),
    					listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[16]),
    					listen_dev(div23, "click", /*click_handler_3*/ ctx[17], false, false, false),
    					listen_dev(input4, "change", /*input4_change_input_handler*/ ctx[18]),
    					listen_dev(input4, "input", /*input4_change_input_handler*/ ctx[18]),
    					listen_dev(div29, "click", /*click_handler_4*/ ctx[19], false, false, false),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[20]),
    					listen_dev(div35, "click", /*click_handler_5*/ ctx[21], false, false, false),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[22]),
    					listen_dev(div41, "click", /*click_handler_6*/ ctx[23], false, false, false),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[24]),
    					listen_dev(div46, "click", /*click_handler_7*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*boxColor*/ 64) {
    				set_style(div0, "background-color", /*boxColor*/ ctx[6]);
    			}

    			if (!current || dirty & /*boxShadow*/ 256) {
    				set_style(div0, "box-shadow", /*boxShadow*/ ctx[8]);
    			}

    			if (dirty & /*shadowInset*/ 1) {
    				input0.checked = /*shadowInset*/ ctx[0];
    			}

    			if (!current || dirty & /*bgColor*/ 128) {
    				set_style(div2, "background-color", /*bgColor*/ ctx[7]);
    			}

    			if (!current || dirty & /*shadowX*/ 2) set_data_dev(t7, /*shadowX*/ ctx[1]);

    			if (dirty & /*shadowX*/ 2) {
    				set_input_value(input1, /*shadowX*/ ctx[1]);
    			}

    			if (!current || dirty & /*shadowY*/ 4) set_data_dev(t13, /*shadowY*/ ctx[2]);

    			if (dirty & /*shadowY*/ 4) {
    				set_input_value(input2, /*shadowY*/ ctx[2]);
    			}

    			if (!current || dirty & /*shadowBlur*/ 8) set_data_dev(t19, /*shadowBlur*/ ctx[3]);

    			if (dirty & /*shadowBlur*/ 8) {
    				set_input_value(input3, /*shadowBlur*/ ctx[3]);
    			}

    			if (!current || dirty & /*shadowSpread*/ 16) set_data_dev(t25, /*shadowSpread*/ ctx[4]);

    			if (dirty & /*shadowSpread*/ 16) {
    				set_input_value(input4, /*shadowSpread*/ ctx[4]);
    			}

    			if (!current || dirty & /*shadowColor*/ 32) set_data_dev(t31, /*shadowColor*/ ctx[5]);

    			if (dirty & /*shadowColor*/ 32) {
    				set_input_value(input5, /*shadowColor*/ ctx[5]);
    			}

    			if (!current || dirty & /*boxColor*/ 64) set_data_dev(t37, /*boxColor*/ ctx[6]);

    			if (dirty & /*boxColor*/ 64) {
    				set_input_value(input6, /*boxColor*/ ctx[6]);
    			}

    			if (!current || dirty & /*bgColor*/ 128) set_data_dev(t43, /*bgColor*/ ctx[7]);

    			if (dirty & /*bgColor*/ 128) {
    				set_input_value(input7, /*bgColor*/ ctx[7]);
    			}

    			if (!current || dirty & /*boxColor*/ 64) set_data_dev(t50, /*boxColor*/ ctx[6]);
    			if (!current || dirty & /*boxShadow*/ 256) set_data_dev(t54, /*boxShadow*/ ctx[8]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div49);
    			destroy_component(header);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function copyToClipboard() {
    	const element = document.getElementById("css-box");
    	navigator.clipboard.writeText(element.innerText);
    }

    function instance($$self, $$props, $$invalidate) {
    	let boxShadow;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const defaultValues = {
    		boxColor: "#85b6ff",
    		bgColor: "#ffffff",
    		shadowInset: false,
    		shadowX: 0,
    		shadowY: 4,
    		shadowBlur: 10,
    		shadowSpread: 0,
    		shadowColor: "#8f8f8f"
    	};

    	let boxColor = defaultValues.boxColor;
    	let bgColor = defaultValues.bgColor;
    	let shadowInset = defaultValues.shadowInset;
    	let shadowX = defaultValues.shadowX;
    	let shadowY = defaultValues.shadowY;
    	let shadowBlur = defaultValues.shadowBlur;
    	let shadowSpread = defaultValues.shadowSpread;
    	let shadowColor = defaultValues.shadowColor;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		shadowInset = this.checked;
    		$$invalidate(0, shadowInset);
    	}

    	const click_handler = () => $$invalidate(1, shadowX = defaultValues.shadowX);

    	function input1_change_input_handler() {
    		shadowX = to_number(this.value);
    		$$invalidate(1, shadowX);
    	}

    	const click_handler_1 = () => $$invalidate(2, shadowY = defaultValues.shadowY);

    	function input2_change_input_handler() {
    		shadowY = to_number(this.value);
    		$$invalidate(2, shadowY);
    	}

    	const click_handler_2 = () => $$invalidate(3, shadowBlur = defaultValues.shadowBlur);

    	function input3_change_input_handler() {
    		shadowBlur = to_number(this.value);
    		$$invalidate(3, shadowBlur);
    	}

    	const click_handler_3 = () => $$invalidate(4, shadowSpread = defaultValues.shadowSpread);

    	function input4_change_input_handler() {
    		shadowSpread = to_number(this.value);
    		$$invalidate(4, shadowSpread);
    	}

    	const click_handler_4 = () => $$invalidate(5, shadowColor = defaultValues.shadowColor);

    	function input5_input_handler() {
    		shadowColor = this.value;
    		$$invalidate(5, shadowColor);
    	}

    	const click_handler_5 = () => $$invalidate(6, boxColor = defaultValues.boxColor);

    	function input6_input_handler() {
    		boxColor = this.value;
    		$$invalidate(6, boxColor);
    	}

    	const click_handler_6 = () => $$invalidate(7, bgColor = defaultValues.bgColor);

    	function input7_input_handler() {
    		bgColor = this.value;
    		$$invalidate(7, bgColor);
    	}

    	const click_handler_7 = () => copyToClipboard();

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		defaultValues,
    		boxColor,
    		bgColor,
    		shadowInset,
    		shadowX,
    		shadowY,
    		shadowBlur,
    		shadowSpread,
    		shadowColor,
    		copyToClipboard,
    		boxShadow
    	});

    	$$self.$inject_state = $$props => {
    		if ("boxColor" in $$props) $$invalidate(6, boxColor = $$props.boxColor);
    		if ("bgColor" in $$props) $$invalidate(7, bgColor = $$props.bgColor);
    		if ("shadowInset" in $$props) $$invalidate(0, shadowInset = $$props.shadowInset);
    		if ("shadowX" in $$props) $$invalidate(1, shadowX = $$props.shadowX);
    		if ("shadowY" in $$props) $$invalidate(2, shadowY = $$props.shadowY);
    		if ("shadowBlur" in $$props) $$invalidate(3, shadowBlur = $$props.shadowBlur);
    		if ("shadowSpread" in $$props) $$invalidate(4, shadowSpread = $$props.shadowSpread);
    		if ("shadowColor" in $$props) $$invalidate(5, shadowColor = $$props.shadowColor);
    		if ("boxShadow" in $$props) $$invalidate(8, boxShadow = $$props.boxShadow);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*shadowInset, shadowX, shadowY, shadowBlur, shadowSpread, shadowColor*/ 63) {
    			$$invalidate(8, boxShadow = `${shadowInset ? "inset " : ""}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`);
    		}
    	};

    	return [
    		shadowInset,
    		shadowX,
    		shadowY,
    		shadowBlur,
    		shadowSpread,
    		shadowColor,
    		boxColor,
    		bgColor,
    		boxShadow,
    		defaultValues,
    		input0_change_handler,
    		click_handler,
    		input1_change_input_handler,
    		click_handler_1,
    		input2_change_input_handler,
    		click_handler_2,
    		input3_change_input_handler,
    		click_handler_3,
    		input4_change_input_handler,
    		click_handler_4,
    		input5_input_handler,
    		click_handler_5,
    		input6_input_handler,
    		click_handler_6,
    		input7_input_handler,
    		click_handler_7
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
