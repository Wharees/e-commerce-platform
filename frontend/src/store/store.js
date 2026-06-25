import create from 'zustand';
import api from '../utils/api';
/**
 * Authentication store
 */
export const useAuthStore = create((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  setToken: (token) => {
    set({ accessToken: token });
    localStorage.setItem('accessToken', token);
    sessionStorage.setItem('accessToken', token);
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
  },

  login: (user, token) => {
    set({ user, accessToken: token, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('accessToken', token);
  },
}));

/**
 * Cart store
 */
/**
 * Cart store (Upgraded to talk to the backend!)
 */
/**
 * Cart store (Upgraded with Backend Sync & Error Rollbacks!)
 */
export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  fetchCart: async () => {
    try {
      const response = await api.get('/cart'); 
      const cartData = response.data;
      let fetchedItems = [];
      
      if (Array.isArray(cartData)) {
        fetchedItems = cartData;
      } else if (cartData.items) {
        fetchedItems = cartData.items;
      } else if (cartData.cart && cartData.cart.items) {
        fetchedItems = cartData.cart.items;
      }

      set({ items: fetchedItems });
      get().calculateTotal();
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
    }
  },

  addToCart: async (product, quantity) => {
    // 1. Optimistic UI update (feels fast for the user)
    const { items } = get();
    const existingItem = items.find(item => item._id === product._id || item.product?._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
      set({ items: [...items] });
    } else {
      set({ items: [...items, { ...product, quantity }] });
    }
    get().calculateTotal();

    // 2. Tell the backend to save it permanently!
    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: quantity
      });
    } catch (error) {
      console.error("Failed to add to backend:", error);
      alert("Failed to save item to cart in the database.");
      get().fetchCart(); // Rollback to truth
    }
  },

  removeFromCart: async (productId) => {
    // 1. Remove it from the local screen instantly
    set(state => ({
      items: state.items.filter(item => item._id !== productId && item.product?._id !== productId)
    }));
    get().calculateTotal();
    
    // 2. Tell the backend to delete it permanently
    try {
      // ⚠️ IMPORTANT: If this alert pops up, we need to check your backend routes!
      // Sometimes it is '/cart/item/${productId}' or just '/cart/${productId}'
      await api.delete(`/cart/remove/${productId}`); 
    } catch (error) {
      console.error("Failed to remove from backend:", error.response?.data || error.message);
      alert("Backend refused to delete the item! Check your console.");
      
      // The backend failed, so we must fetch the truth again to remove the 'ghost'
      get().fetchCart(); 
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) return;

    // 1. Update UI instantly
    const { items } = get();
    const item = items.find(i => i._id === productId || i.product?._id === productId);
    if (item) {
      item.quantity = quantity;
      set({ items: [...items] });
      get().calculateTotal();
    }

    // 2. Tell backend
    try {
      // Adjust this URL if your backend expects something else!
      await api.put(`/cart/update`, { productId, quantity });
    } catch (error) {
      console.error("Failed to update backend:", error);
      get().fetchCart(); // Rollback to truth
    }
  },

  calculateTotal: () => {
    const { items } = get();
    const total = items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    set({ total });
  },

  clearCart: () => {
    set({ items: [], total: 0 });
  },
}));

/**
 * Notification store
 */
export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 5000);
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));
