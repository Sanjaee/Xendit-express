const Xendit = require('xendit-node');
const x = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

const { VirtualAcc, Invoice, EWallet } = x;
const va = new VirtualAcc({});
const invoice = new Invoice({});
const ewallet = new EWallet({});

exports.createVirtualAccount = async (externalId, amount, productName) => {
  try {
    const vaData = await va.createFixedVA({
      externalID: externalId,
      bankCode: 'BCA',
      name: `Payment for ${productName}`,
      expectedAmt: amount,
      isClosed: true,
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return {
      id: vaData.id,
      externalId: vaData.external_id,
      bank_code: vaData.bank_code,
      account_number: vaData.account_number,
      amount: vaData.expected_amount,
      expiration_date: vaData.expiration_date,
    };
  } catch (error) {
    console.error('Xendit VA creation error:', error);
    throw error;
  }
};

exports.createCreditCardPayment = async (externalId, amount, productName) => {
  try {
    const invoiceData = await invoice.createInvoice({
      externalID: externalId,
      amount,
      description: `Payment for ${productName}`,
      payerEmail: 'customer@example.com',
      successRedirectURL: `${process.env.FRONTEND_URL}/payment-success`,
    });

    return {
      id: invoiceData.id,
      externalId: invoiceData.external_id,
      paymentUrl: invoiceData.invoice_url,
      amount: invoiceData.amount,
    };
  } catch (error) {
    console.error('Xendit Credit Card payment error:', error);
    throw error;
  }
};

exports.createEWalletPayment = async (externalId, amount, productName) => {
  try {
    const ewalletData = await ewallet.createEWalletCharge({
      referenceID: externalId,
      currency: 'IDR',
      amount,
      checkoutMethod: 'ONE_TIME_PAYMENT',
      channelCode: 'ID_OVO',
      channelProperties: {
        mobileNumber: '08123123123',
        successRedirectURL: `${process.env.FRONTEND_URL}/payment-success`,
      },
    });
    

    return {
      id: ewalletData.id,
      externalId: ewalletData.reference_id,
      paymentUrl: ewalletData.actions.desktop_web_checkout_url,
      amount: ewalletData.amount,
      payment_type: ewalletData.channel_code,
    };
  } catch (error) {
    console.error('Xendit E-Wallet payment error:', error.response?.data || error);
    throw error;
  }
};
