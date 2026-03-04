class User {
  constructor(data) {
    this._id = data._id || this.generateId();
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.phone = data.phone || '';
    this.role = data.role || 'user'; // 'user' or 'admin'
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    
    // Profile Information
    this.profile = {
      avatar: data.profile?.avatar || '',
      dateOfBirth: data.profile?.dateOfBirth || '',
      gender: data.profile?.gender || '', // 'male', 'female', 'other'
    };
    
    // Delivery Address
    this.address = {
      street: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      pincode: data.address?.pincode || '',
      country: data.address?.country || 'India',
      landmark: data.address?.landmark || ''
    };
    
    // Measurements for custom clothing
    this.measurements = {
      // Upper Body
      chest: data.measurements?.chest || '',
      shoulder: data.measurements?.shoulder || '',
      sleeveLength: data.measurements?.sleeveLength || '',
      armHole: data.measurements?.armHole || '',
      frontNeck: data.measurements?.frontNeck || '',
      backNeck: data.measurements?.backNeck || '',
      
      // Lower Body
      waist: data.measurements?.waist || '',
      hips: data.measurements?.hips || '',
      inseam: data.measurements?.inseam || '',
      thigh: data.measurements?.thigh || '',
      knee: data.measurements?.knee || '',
      ankle: data.measurements?.ankle || '',
      outseam: data.measurements?.outseam || '',
      
      // Full Body
      height: data.measurements?.height || '',
      weight: data.measurements?.weight || '',
      
      // Notes
      notes: data.measurements?.notes || ''
    };
    
    // Default size preferences
    this.sizePreferences = {
      shirtSize: data.sizePreferences?.shirtSize || '', // XS, S, M, L, XL, XXL, XXXL
      pantSize: data.sizePreferences?.pantSize || '',
      kurtaSize: data.sizePreferences?.kurtaSize || '',
      sherwaniSize: data.sizePreferences?.sherwaniSize || '',
      lehengaSize: data.sizePreferences?.lehengaSize || ''
    };
    
    // Order history
    this.orders = data.orders || [];
    
    // Testimonials submitted by user
    this.testimonials = data.testimonials || [];
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
  
  update(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.phone) this.phone = data.phone;
    if (data.profile) this.profile = { ...this.profile, ...data.profile };
    if (data.address) this.address = { ...this.address, ...data.address };
    if (data.measurements) this.measurements = { ...this.measurements, ...data.measurements };
    if (data.sizePreferences) this.sizePreferences = { ...this.sizePreferences, ...data.sizePreferences };
    this.updatedAt = new Date().toISOString();
    return this;
  }
  
  addOrder(order) {
    this.orders.unshift({
      orderId: order.orderId || 'ORD_' + Date.now(),
      items: order.items || [],
      total: order.total || 0,
      status: order.status || 'pending',
      type: order.type || 'custom', // 'custom' or 'ready-made'
      createdAt: new Date().toISOString(),
      deliveryAddress: order.deliveryAddress || this.address
    });
    this.updatedAt = new Date().toISOString();
  }
  
  addTestimonial(testimonialId) {
    this.testimonials.push(testimonialId);
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = User;
