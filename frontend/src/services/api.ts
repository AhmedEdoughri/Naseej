const API_BASE_URL = "http://localhost:5000/api";

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers({
    "Content-Type": "application/json",
    ...options.headers,
  });

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Check if the error is specifically a 401 Unauthorized
      if (response.status === 401) {
        // Clear all stored user data
        localStorage.clear();
        // Force a redirect to the home page, which will then show the login options
        window.location.href = "/";
        // Throw an error to stop the current function from proceeding
        throw new Error("Session expired. Redirecting...");
      }

      const errorData = await response.json();
      throw new Error(
        errorData.message || `API call failed: ${response.statusText}`
      );
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return { success: true };
    }
    return response.json();
  } catch (error) {
    console.error("API service error:", error);
    throw error;
  }
};

export const api = {
  // --- Auth ---
  login: async (identifier: string, password: string, role: string | null) => {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, role }), // Changed email to identifier
    });
  },
  registerStore: async (data: any) => {
    return fetchApi("/auth/register-store", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (newPassword: string, confirmPassword: string) => {
    return fetchApi("/users/change-password", {
      method: "PUT",
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  // --- Stores Management ---
  getStores: async () => {
    return fetchApi("/stores");
  },
  createStore: async (storeData: any) => {
    return fetchApi("/stores", {
      method: "POST",
      body: JSON.stringify(storeData),
    });
  },
  createCustomer: async (customerData: any) => {
    return fetchApi("/users/customer", {
      // This points to the correct new route
      method: "POST",
      body: JSON.stringify(customerData),
    });
  },
  updateStore: async (storeId: string, storeData: any) => {
    return fetchApi(`/stores/${storeId}`, {
      method: "PUT",
      body: JSON.stringify(storeData),
    });
  },
  deleteStore: async (storeId: string) => {
    return fetchApi(`/stores/${storeId}`, {
      method: "DELETE",
    });
  },

  // --- Items ---
  updateItemStatus: async (itemId: string, to_status: string, note: string) => {
    const userId = localStorage.getItem("userId");
    return fetchApi(`/items/${itemId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ to_status, changed_by: userId, note }),
    });
  },

  // --- User Management for Admin Panel ---
  getUsers: async () => {
    return fetchApi("/users");
  },
  getRoles: async () => {
    return fetchApi("/users/roles");
  },
  createUser: async (userData: any) => {
    return fetchApi("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  deleteUser: async (userId: string) => {
    return fetchApi(`/users/${userId}`, {
      method: "DELETE",
    });
  },
  updateUser: async (userId: string, userData: any) => {
    return fetchApi(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
  approveUser: async (userId: string) => {
    return fetchApi(`/users/${userId}/approve`, {
      method: "PATCH",
    });
  },
  denyRegistration: async (userId: string) => {
    return fetchApi(`/users/${userId}/deny`, {
      method: "DELETE",
    });
  },

  // --- Status Management ---
  getStatuses: async () => {
    return fetchApi("/statuses");
  },
  createStatus: async (statusData: any) => {
    return fetchApi("/statuses", {
      method: "POST",
      body: JSON.stringify(statusData),
    });
  },
  updateStatus: async (statusId: number, statusData: any) => {
    return fetchApi(`/statuses/${statusId}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },
  deleteStatus: async (statusId: number) => {
    return fetchApi(`/statuses/${statusId}`, {
      method: "DELETE",
    });
  },
  reorderStatuses: async (statuses: any[]) => {
    return fetchApi("/statuses/reorder", {
      method: "PUT",
      body: JSON.stringify(statuses),
    });
  },

  // --- Reports ---
  getPickupRequestsReport: async (params: {
    startDate?: string;
    endDate?: string;
    storeId?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/reports/pickup-requests?${query}`);
  },

  // --- Settings Management ---
  getSettings: async () => {
    return fetchApi("/settings");
  },
  updateSettings: async (settingsData: any) => {
    return fetchApi("/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    });
  },

  // --- Contact Form ---
  sendMessage: async (formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) => {
    return fetchApi("/contact", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  },
};
