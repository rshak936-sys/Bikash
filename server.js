const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// নমুনা বিকাশ ট্রানজেকশন ডাটাবেজ
// বাস্তবে আপনার বিকাশ মার্চেন্ট API অথবা SMS গেটওয়ের সাথে এটি কানেক্ট থাকবে
const validTransactions = {
  '8N7A6D5W': { amount: 30, sender: '01931711863', used: false },
  '9B8C7D6E': { amount: 158, sender: '01700000000', used: false }
};

// পেমেন্ট ভেরিফিকেশন এপিআই (API Endpoint)
app.post('/api/verify-bkash', (req, res) => {
  const { sender_number, trx_id, amount } = req.body;

  if (!sender_number || !trx_id || !amount) {
    return res.status(400).json({
      success: false,
      message: 'সবগুলো ঘর সঠিকভাবে পূরণ করুন!'
    });
  }

  const cleanTrx = trx_id.trim().toUpperCase();
  const txData = validTransactions[cleanTrx];

  // ১. ট্রানজেকশন আইডি আছে কি না যাচাই
  if (!txData) {
    return res.status(404).json({
      success: false,
      message: 'ভুল TrxID অথবা পেমেন্ট পাওয়া যায়নি!'
    });
  }

  // ২. ট্রানজেকশন আগেই ব্যবহার করা হয়েছে কি না
  if (txData.used) {
    return res.status(400).json({
      success: false,
      message: 'এই TrxID দিয়ে আগেই পেমেন্ট ভেরিফাই করা হয়েছে!'
    });
  }

  // ৩. টাকার পরিমাণ সঠিক কি না
  if (Number(txData.amount) !== Number(amount)) {
    return res.status(400).json({
      success: false,
      message: `টাকার পরিমাণ মিলেনি! প্রয়োজন ৳${amount}, কিন্তু পাওয়া গেছে ৳${txData.amount}`
    });
  }

  // ভেরিফাইড হিসেবে চিহ্নিত করা
  txData.used = true;

  return res.json({
    success: true,
    message: 'পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে!',
    trx_id: cleanTrx,
    amount: txData.amount
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`bKash Verifier Server running on port ${PORT}`);
});