const { MappingBaseType } = require("../base");
const { isObjectType, isArray, isReferenceArray } = require("../util");
const { propsToMapping } = require("../../props-to-mapping")

function toArray(obj) {
  return isArray(obj.type) && MappingArray.create(obj).convert();
}

class MappingArray extends MappingBaseType {
  get baseType() {
    return "nested";
  }

  get entry() {
    return {
      ...this.lookedUpEntry,
      ...this.resolvedEntry
    };
  }

  get resolvedResult() {
    let result = this.createResult();

    if (result.type == 'object') {
      let parent_name = this.resolveFirstItem.key
      let properties = this.resolveFirstItem.properties
      result.properties = propsToMapping({ parent_name, properties}, this.config)
    }

    if (this.isReference) {
      delete result.type
    };
    return result;
  }

  get includeInParent() {
    return false;
  }

  get resolvedEntry() {
    return this.isReference ? this.referenceEntry : this.nestedEntry;
  }

  get nestedEntry() {
    return this.includeInParent
      ? {
          include_in_parent: true
        }
      : {};
  }

  get isReference() {
    return isReferenceArray(this.value);
  }

  get referenceEntry() {
    return {
      _parent: { type: this.parentName },
      _source: { enabled: true },
      _all: { enabled: false }
    };
  }

  get validItems() {
    return Array.isArray(this.items) || isObjectType(this.items);
  }

  get resolveFirstItem() {
    if (!this.validItems) return {};
    return Array.isArray(this.items) ? this.selectFirstItem : this.items;
  }

  get firstItem() {
    return this.items[0];
  }

  get selectFirstItem() {
    return this.hasValidItemTypes ? this.firstItem : this.invalidItemTypes();
  }

  invalidItemTypes() {
    this.error(
      `Invalid item types for ${
        this.key
      }. All array items must share the same type to be mappable to ElasticSearch`,
      {
        schema: this.schema,
        items: this.items
      }
    );
  }

  get hasValidItemTypes() {
    return this.hasSameItemTypes;
  }

  get hasSameItemTypes() {
    const type = this.firstItem.type;
    return this.items.every(item => item.type === type);
  }

  get items() {
    return this.value.items;
  }

  get arrayType() {
    return this.resolveFirstItem.type;
  }

  get resolvedArrayType() {
    return this.metaType(this.arrayType);
  }

  get type() {
    return this.configType || this.resolvedArrayType || this.baseType;
  }

  static create(obj) {
    return new MappingArray(obj);
  }
}

module.exports = {
  toArray,
  MappingArray
};
