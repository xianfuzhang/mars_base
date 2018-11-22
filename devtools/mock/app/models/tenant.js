class Tenant {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }

  toJson() {
    return {
      'name': this.name,
      'type': this.type
    }
  }
}

class Segment{
  constructor(name, type, ip_address, value, tenant_name) {
    this.segment_name = name;
    this.segment_type = type;
    this.ip_address = ip_address;
    this.value = value;
    this.tenant_name = tenant_name;
  }

  toJson() {
    return {
      'segment_name': this.segment_name,
      'segment_type': this.segment_type,
      'value': this.value,
      'ip_address': this.ip_address,
      'tenant_name': this.tenant_name
    }
  }
}

module.exports = {Tenant, Segment};