export class genericFactoryRegistry {
  static getDI() {
    return [
      '_'
    ];
  }
/*
  static instance (...args) {
    return new genericFactoryRegistry(args);
  }*/

  constructor(...args) {
    this.di = [];
    genericFactoryRegistry.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this._registry = {};
    //this._default = null;

    /*// aliasedType -> type
    this._aliasToType = {};

    // type + aliasedName -> name
    this._aliasToName = {};

    this._allAliases = (type) => {
      let result = [type]; let typeAliases = this._aliases[type];

      // as array
      this.di._.each(typeAliases || {}, (_true, name) => {
        this.di._.noop(_true);
        result.push(name);
      });

      return result;
    };

    this._typeRegistry = (type) => {
      let result = this._registry[type]; let alias;

      if (!result) {
        alias = this._aliasToType[type];
        result = alias ? this._registry[alias] : null;
      }

      return result || null;
    };

    this._nameRegistry = (type, name) => {
      let typeNameAlias = this._aliasToName[type];
      let unaliasedName = name;

      if (typeNameAlias && typeNameAlias[name]) {
        unaliasedName = typeNameAlias[name];
      }

      return unaliasedName;
    };

    this.registerTypeAlias = (type, aliases) => {
      let self = this;

      if (!this.di._.isArray(aliases)) {
        aliases = [aliases];
      }

      this.di._.each(aliases, (alias) => {
        // mark them as aliases
        self._aliasToType[alias] = type;
      });
    };

    this.registerNameAlias = (type, name, aliases) => {
      let typeNameAlias = this._aliasToName[type];
      if (!typeNameAlias) {
        typeNameAlias = this._aliasToName[type] = {};
      }
      if (this.di._.isArray[aliases]) {
        aliases = [aliases];
      }
      this.di._.each(aliases, (alias) => {
        typeNameAlias[alias] = name;
      });
    };*/

    this.get = (type) => {
      /*let typeRegistry = this._typeRegistry(type);
      let unaliasedName = this._nameRegistry(type, name);
      return typeRegistry ? typeRegistry[unaliasedName] || null : null;*/
      return this._registry[type] ? this._registry[type] : null;
    };

  /*  this.getDefault = function () {
      return this._default;
    };*/

    this.register = (type, val) => {
      let typeRegistry = this._registry[type];
      if (!typeRegistry) {
        //typeRegistry = this._registry[type] = {};
        this._registry[type] = val;
      }
      //typeRegistry[name] = val;
    };

   /* this.registerDefault = function (val) {
      this._default = val;
    };*/
  }

  /**
   * @description Returns Factory object
   */

  createGenericFactory (_) {
    return new genericFactoryRegistry(_);
  };
}

genericFactoryRegistry.$inject = genericFactoryRegistry.getDI();
genericFactoryRegistry.$$ngIsClass = true;
