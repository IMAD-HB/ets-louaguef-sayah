import PDFDocument from 'pdfkit';
import moment from 'moment';
import 'moment/locale/fr.js';

moment.locale('fr');

export const generateReceiptBuffer = async (order, user) => {
  const doc = new PDFDocument({ size: 'A5', margin: 40 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Title
  doc.fontSize(16).text('Reçu de Commande', { align: 'center' });
  doc.moveDown();

  // Info
  doc.fontSize(12).text(`Client: ${user.name}`);
  doc.text(`Téléphone: ${user.phoneNumber || '—'}`);
  doc.text(`Date: ${moment(order.createdAt).format('LLL')}`);
  doc.text(`ID Commande: ${order._id}`);
  doc.moveDown();

  // Table Header
  doc.fontSize(12).text('Produit', 40, doc.y).text('Qté', 180, doc.y).text('Prix', 230, doc.y).text('Total', 290, doc.y);
  doc.moveTo(40, doc.y + 2).lineTo(400, doc.y + 2).stroke();
  doc.moveDown();

  // Items
  for (const item of order.items) {
    const total = item.unitPrice * item.quantity;
    doc.text(item.product.name, 40, doc.y)
       .text(item.quantity, 180, doc.y)
       .text(`${item.unitPrice} DZD`, 230, doc.y)
       .text(`${total} DZD`, 290, doc.y);
    doc.moveDown();
  }

  // Totals
  doc.moveDown();
  doc.fontSize(12).text(`Total: ${order.totalPrice} DZD`);
  doc.text(`Payé: ${order.amountPaid} DZD`);
  doc.text(`Reste: ${order.remainingDebt} DZD`);

  doc.moveDown(2);
  doc.fontSize(10).text('Merci pour votre commande !', { align: 'center' });

  doc.end();

  return Buffer.concat(buffers);
};
