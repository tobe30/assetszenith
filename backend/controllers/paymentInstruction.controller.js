import PaymentInstruction from "../models/PaymentInstruction.js";

const METHOD_DEFAULTS = {
  Bitcoin: {
    title: "Bitcoin payment",
    address: "",
    network: "Bitcoin network",
    instructions: "Send only Bitcoin over the Bitcoin network to the verified address below.",
  },
  Litecoin: {
    title: "Litecoin payment",
    address: "",
    network: "Litecoin network",
    instructions: "Send only Litecoin over the Litecoin network to the verified address below.",
  },
  Ethereum: {
    title: "Ethereum payment",
    address: "",
    network: "Ethereum network",
    instructions: "Confirm the supported network before sending to the verified address below.",
  },
  "Bitcoin Cash": {
    title: "Bitcoin Cash payment",
    address: "",
    network: "Bitcoin Cash network",
    instructions: "Send only Bitcoin Cash over the Bitcoin Cash network to the verified address below.",
  },
  DASH: {
    title: "DASH payment",
    address: "",
    network: "Dash network",
    instructions: "Send only DASH over the Dash network to the verified address below.",
  },
  Dogecoin: {
    title: "Dogecoin payment",
    address: "",
    network: "Dogecoin network",
    instructions: "Send only Dogecoin over the Dogecoin network to the verified address below.",
  },
  "Bank Transfer": {
    title: "Bank transfer",
    accountName: "",
    bankName: "",
    accountNumber: "",
    swiftCode: "",
    instructions: "Use the verified account details below. Include your account email or deposit reference in the transfer note if your bank allows it.",
  },
  "Perfect Money": {
    title: "Perfect Money payment",
    paymentAccount: "",
    recipientName: "",
    instructions: "Send your payment to the Perfect Money account below and include your deposit reference.",
  },
  "Western Union": {
    title: "Western Union payment",
    recipientName: "",
    recipientCountry: "",
    instructions: "Send the transfer to the recipient below, then submit the MTCN reference for verification.",
  },
  Moneygram: {
    title: "MoneyGram payment",
    recipientName: "",
    recipientCountry: "",
    instructions: "Send the transfer to the recipient below, then submit the reference number for verification.",
  },
  "Credit Card": {
    title: "Credit card payment",
    paymentUrl: "",
    instructions: "Complete payment only through the secure payment link below.",
  },
  Payeer: {
    title: "Payeer payment",
    paymentAccount: "",
    recipientName: "",
    instructions: "Send your payment to the Payeer account below and include your deposit reference.",
  },
  VeChain: {
    title: "VeChain payment",
    address: "",
    network: "VeChain network",
    instructions: "Send only VeChain (VET) over the VeChain network to the verified address below.",
  },
  "Verus Coin": {
    title: "Verus Coin payment",
    address: "",
    network: "Verus network",
    instructions: "Send only Verus Coin over the Verus network to the verified address below.",
  },
  "Tether (USDT) TRC-20": {
    title: "Tether (USDT) payment",
    address: "",
    network: "TRON (TRC-20)",
    instructions: "Confirm the exact USDT network before sending. A transfer on the wrong network may not be recoverable.",
  },
};

const ALLOWED_FIELDS = ["title", "instructions", "address", "network", "accountName", "bankName", "accountNumber", "swiftCode", "paymentAccount", "recipientName", "recipientCountry", "paymentUrl"];
const FIELD_LIMITS = { title: 100, instructions: 500, address: 255, network: 80, accountName: 120, bankName: 120, accountNumber: 80, swiftCode: 40, paymentAccount: 120, recipientName: 120, recipientCountry: 100, paymentUrl: 500 };
const LEGACY_SAMPLE_VALUES = {
  Bitcoin: { address: "DEMO-BTC-ADDRESS-NOT-VALID" },
  Litecoin: { address: "DEMO-LTC-ADDRESS-NOT-VALID" },
  Ethereum: { address: "DEMO-ETH-ADDRESS-NOT-VALID" },
  "Bitcoin Cash": { address: "DEMO-BCH-ADDRESS-NOT-VALID" },
  Dogecoin: { address: "DEMO-DOGE-ADDRESS-NOT-VALID" },
  "Bank Transfer": { accountName: "Asset Zenith Demo Account", bankName: "Demo Bank (Sample Only)", accountNumber: "0000000000", swiftCode: "DEMOXX00" },
  USDT: { address: "DEMO-USDT-ADDRESS-NOT-VALID", network: "TRC20 (demo only)" },
  "Tether (USDT) TRC-20": { address: "DEMO-USDT-ADDRESS-NOT-VALID", network: "TRC20 (demo only)" },
};

const cleanSavedInstruction = (method, defaults, saved = {}) => {
  const cleaned = { ...saved };
  delete cleaned.demo;
  for (const [field, sampleValue] of Object.entries(LEGACY_SAMPLE_VALUES[method] || {})) {
    if (cleaned[field] === sampleValue) cleaned[field] = defaults[field];
  }
  return { ...defaults, ...cleaned };
};

const getSavedMethods = async () => {
  const settings = await PaymentInstruction.findOne({ key: "depositPaymentInstructions" }).lean();
  const savedMethods = settings?.methods || {};
  return Object.fromEntries(Object.entries(METHOD_DEFAULTS).map(([method, defaults]) => [
    method,
    cleanSavedInstruction(method, defaults, savedMethods[method]
      || (method === "Bank Transfer" ? savedMethods["Bank transfer"] : null)
      || (method === "Tether (USDT) TRC-20" ? savedMethods.USDT : null)),
  ]));
};

export const getDepositPaymentInstructions = async (_req, res) => {
  try {
    const methods = await getSavedMethods();
    return res.status(200).json({ success: true, methods });
  } catch (error) {
    console.error("Error loading deposit payment instructions:", error);
    return res.status(500).json({ success: false, message: "Unable to load payment instructions right now." });
  }
};

export const updateDepositPaymentInstructions = async (req, res) => {
  try {
    const { method } = req.params;
    if (!Object.hasOwn(METHOD_DEFAULTS, method)) {
      return res.status(400).json({ success: false, message: "Choose a supported deposit payment method." });
    }

    const input = req.body?.instruction;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return res.status(400).json({ success: false, message: "Enter valid payment instructions." });
    }

    const instruction = { ...METHOD_DEFAULTS[method] };
    for (const field of ALLOWED_FIELDS) {
      if (input[field] === undefined) continue;
      if (typeof input[field] !== "string") {
        return res.status(400).json({ success: false, message: `${field} must be text.` });
      }
      const value = input[field].trim();
      if (value.length > FIELD_LIMITS[field]) {
        return res.status(400).json({ success: false, message: `${field} must be ${FIELD_LIMITS[field]} characters or fewer.` });
      }
      instruction[field] = value;
    }
    if (!instruction.title || !instruction.instructions) {
      return res.status(400).json({ success: false, message: "Add a title and instructions for this payment method." });
    }

    const requiredFields = method === "Bank Transfer"
      ? ["accountName", "bankName", "accountNumber"]
      : ["Western Union", "Moneygram"].includes(method)
        ? ["recipientName", "recipientCountry"]
        : ["Perfect Money", "Payeer"].includes(method)
          ? ["paymentAccount"]
          : method === "Credit Card"
            ? ["paymentUrl"]
            : ["network", "address"];
    if (requiredFields.some((field) => !instruction[field])) {
      return res.status(400).json({ success: false, message: "Enter the required receiving details before saving this payment method." });
    }
    if (method === "Credit Card") {
      try {
        if (new URL(instruction.paymentUrl).protocol !== "https:") throw new Error("Invalid protocol");
      } catch {
        return res.status(400).json({ success: false, message: "Enter a valid secure HTTPS payment link." });
      }
    }

    const existing = await PaymentInstruction.findOne({ key: "depositPaymentInstructions" });
    const methods = { ...(existing?.methods || {}), [method]: instruction };
    const settings = await PaymentInstruction.findOneAndUpdate(
      { key: "depositPaymentInstructions" },
      { $set: { methods, updatedBy: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    const allMethods = await getSavedMethods();

    return res.status(200).json({
      success: true,
      message: `${method} payment instructions saved.`,
      methods: allMethods,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Error saving deposit payment instructions:", error);
    return res.status(500).json({ success: false, message: "Unable to save payment instructions right now." });
  }
};
