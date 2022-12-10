class Storage {

    static has(key) {
        return Object.prototype.hasOwnProperty.call(this.cache, key);
    }

    static get(key) {
        if (typeof this.cache[key] !== "undefined" || typeof this.defaults === "undefined") {
            return this.cache[key];
        }
        if (typeof this.defaults[key] === "undefined") {
            console.warn('Unrecognized storage key "%s"', key);
        }
        return this.defaults[key];
    }

    static set(key, value) {
        this.cache[key] = value;
        return this._adapter.set({[key]: value});
    }

    static import(entries) {
        for (const [key, value] of Object.entries(entries)) {
            this.cache[key] = value;
        }
        return this._adapter.set(entries);
    }

    static remove(key) {
        if (typeof this.cache[key] !== "undefined") {
            delete this.cache[key];
        }
        return this._adapter.remove(key);
    }

    static keys(prefix = "") {
        return Object.keys(this.cache).filter(k => k.startsWith(prefix));
    }

    static entries() {
        return Object.entries(this.cache);
    }

    static async clear(force = false) {

        let tmp;
        if (!force) {
            tmp = (this.persistent ?? []).reduce((acc, option) => {
                acc[option] = this.cache[option];
                return acc;
            }, {});
        }

        await this._adapter.clear();
        this.cache = {};

        if (!force) {
            await this.import(tmp);
        }
    }

    // load whole storage and make local copy
    static async init() {

        const area = this._adapter === browser.storage.sync ? "sync" : "local";
        const cache = Storage.caches[area];

        if (typeof cache !== "undefined") {
            this.cache = cache;
            return this.cache;
        }

        Storage.caches[area] = {};
        this.cache = Storage.caches[area];

        browser.storage.onChanged.addListener((changes, eventArea) => {

            if (area !== eventArea) { return; }

            for (const [key, {"newValue": val}] of Object.entries(changes)) {
                this.cache[key] = val;
            }
        });

        return Object.assign(this.cache, await this._adapter.get(null));
    }

    static then(onDone, onCatch) {
        const promise = this._initialized ? Promise.resolve(this.cache) : this.init();
        this._initialized = true;
        return promise.then(onDone, onCatch);
    }

    static toJson() {
        return JSON.stringify(this.cache, null, 4);
    }
}

Storage.caches = {};

export {Storage};
