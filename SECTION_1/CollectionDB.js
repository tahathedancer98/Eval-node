class Collection{
    constructor(collectionName) {
      this.collectionName = collectionName;
      this.maBD = new Map();
      this.id = 0;
    }
    insertOne(obj) {
      this.maBD.set(this.id, obj);
      return { id: this.id++, inserted: obj };
    }
    getOne(id) {
      if (this.exists(id)) {
        return this.maBD.get(id);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    }
    exists(id) {
      return this.maBD.has(id);
    }
    updateOne(id, obj) {
      if (this.exists(id)) {
        this.maBD.set(id, obj);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    }
    deleteOne(id) {
      if (this.exists(id)) {
        this.maBD.delete(id);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    }
    getAll() {
      return Object.fromEntries(this.maBD);
    }
    findByProperty(propertyName, value) {
      let result = false;
      this.maBD.forEach((obj, id) => {
        if (!result) {
          if (propertyName in obj && obj[propertyName] === value) {
            result = { id: id, found: obj };
          }
        }
      });
      return result || {};
    }
  }
  
  module.exports = Collection;