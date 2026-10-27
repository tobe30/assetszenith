import { axiosInstance } from "./axios"

export const getAuthuser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data.user
    } catch {
        return null
    }
}

export const signup = async (registerData) => {
    const response = await axiosInstance.post("/auth/register", registerData);
    return response.data;
};

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
};

export const verifyTwoFactorLogin = async (verificationData) => {
    const response = await axiosInstance.post("/auth/login/verify-code", verificationData);
    return response.data;
};

export const startTwoFactorSetup = async () => {
    const response = await axiosInstance.post("/auth/2fa/setup");
    return response.data;
};

export const enableTwoFactor = async (code) => {
    const response = await axiosInstance.post("/auth/2fa/enable", { code });
    return response.data;
};

export const startTwoFactorDisable = async (password) => {
    const response = await axiosInstance.post("/auth/2fa/disable/request", { password });
    return response.data;
};

export const disableTwoFactor = async (code) => {
    const response = await axiosInstance.post("/auth/2fa/disable", { code });
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async (resetData) => {
    const response = await axiosInstance.post("/auth/reset-password", resetData);
    return response.data;
};

export const getAdminUsers = async ({ search = '', page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/admin/users", {
        params: { search, page, limit },
    });
    return response.data;
};

export const getAdminDashboardSummary = async () => {
    const response = await axiosInstance.get("/admin/dashboard-summary");
    return response.data;
};

export const getAdminTransactions = async ({ page = 1, limit = 20, type = '', status = '', adjustmentTarget = '', from = '', to = '' } = {}) => {
    const response = await axiosInstance.get("/admin/transactions", {
        params: { page, limit, type, status, adjustmentTarget, from, to },
    });
    return response.data;
};

export const fundAdminUserWallet = async ({ userId, amount, note, idempotencyKey }) => {
    const response = await axiosInstance.post(`/admin/users/${userId}/wallet/fund`, {
        amount,
        note,
        idempotencyKey,
    });
    return response.data;
};

export const getAdminInvestmentPlans = async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}/investment-plans`);
    return response.data;
};

export const createAdminUserInvestment = async ({ userId, planCode, amount, note, idempotencyKey }) => {
    const response = await axiosInstance.post(`/admin/users/${userId}/investments`, {
        planCode,
        amount,
        note,
        idempotencyKey,
    });
    return response.data;
};

export const getPendingDeposits = async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/transactions/admin/deposits/pending", {
        params: { page, limit },
    });
    return response.data;
};

export const reviewAdminDeposit = async ({ transactionId, decision, reviewNote = '' }) => {
    const response = await axiosInstance.patch(
        `/transactions/admin/deposits/${transactionId}/${decision}`,
        { reviewNote },
    );
    return response.data;
};

export const getPendingWithdrawals = async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/transactions/admin/withdrawals/pending", {
        params: { page, limit },
    });
    return response.data;
};

export const reviewAdminWithdrawal = async ({ transactionId, decision, reviewNote = '' }) => {
    const response = await axiosInstance.patch(
        `/transactions/admin/withdrawals/${transactionId}/${decision}`,
        { reviewNote },
    );
    return response.data;
};

export const logout = async ()=> {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

export const getProfile = async () => {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await axiosInstance.patch("/users/profile", profileData);
    return response.data;
};

export const changeUserPassword = async (passwordData) => {
    const response = await axiosInstance.patch("/users/change-password", passwordData);
    return response.data;
};

export const createDepositRequest = async (depositData) => {
    const response = await axiosInstance.post("/transactions/deposits", depositData);
    return response.data;
};

export const getDepositHistory = async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/transactions/deposits", {
        params: { page, limit },
    });
    return response.data;
};

export const getDepositPaymentInstructions = async () => {
    const response = await axiosInstance.get("/transactions/payment-instructions");
    return response.data;
};

export const createWithdrawalRequest = async (withdrawalData) => {
    const response = await axiosInstance.post("/transactions/withdrawals", withdrawalData);
    return response.data;
};

export const getWithdrawalHistory = async ({ page = 1, limit = 50 } = {}) => {
    const response = await axiosInstance.get("/transactions/withdrawals", {
        params: { page, limit },
    });
    return response.data;
};

export const getMyTransactions = async ({ page = 1, limit = 20, type = '', search = '' } = {}) => {
    const response = await axiosInstance.get("/transactions", {
        params: { page, limit, type, search },
    });
    return response.data;
};

export const getWalletSummary = async () => {
    const response = await axiosInstance.get("/wallet/summary");
    return response.data;
};

export const getInvestmentPlans = async () => {
    const response = await axiosInstance.get("/investments/plans");
    return response.data;
};

export const createInvestment = async (investmentData) => {
    const response = await axiosInstance.post("/investments/create", investmentData);
    return response.data;
};

export const getMyInvestments = async ({ page = 1, limit = 50 } = {}) => {
    const response = await axiosInstance.get("/investments", {
        params: { page, limit },
    });
    return response.data;
};

export const getAdminDepositPaymentInstructions = async () => {
    const response = await axiosInstance.get("/admin/payment-instructions");
    return response.data;
};

export const updateAdminDepositPaymentInstruction = async ({ method, instruction }) => {
    const response = await axiosInstance.put(`/admin/payment-instructions/${encodeURIComponent(method)}`, { instruction });
    return response.data;
};
