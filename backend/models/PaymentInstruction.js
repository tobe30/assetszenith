import mongoose from "mongoose";

const PaymentInstructionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "depositPaymentInstructions" },
    methods: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default mongoose.models.PaymentInstruction || mongoose.model("PaymentInstruction", PaymentInstructionSchema);
