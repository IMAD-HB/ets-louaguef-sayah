import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import amiriFont from "../../assets/fonts/Amiri-Regular.ttf";

// Register Amiri font for Arabic-friendly rendering
Font.register({
  family: "Amiri",
  src: amiriFont,
});

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Amiri",
    direction: "ltr",
    color: "#000",
  },
  companyBlock: {
    marginBottom: 16,
    textAlign: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 10,
  },
  receiptTitle: {
    fontSize: 15,
    marginVertical: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontWeight: "bold",
  },
  section: {
    marginVertical: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  th: {
    padding: 4,
    fontWeight: "bold",
    fontSize: 10,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  td: {
    padding: 4,
    fontSize: 10,
    borderTop: "1 solid #000",
    textAlign: "center",
  },
  colProduct: { width: "50%", textAlign: "left" },
  colQty: { width: "15%" },
  colPU: { width: "17%" },
  colTotal: { width: "18%" },

  totalsBlock: {
    width: "60%",
    marginLeft: "auto",
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalDue: {
    fontWeight: "bold",
    color: "red",
  },
  footer: {
    marginTop: 24,
    fontSize: 10,
    textAlign: "center",
    color: "#555",
  },
});

// Formatters
const fmtNumber = (n) =>
  typeof n === "number" ? n.toLocaleString("fr-DZ") : "—";

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-DZ");
};

// Main PDF Component
const OrderReceiptPDF = ({ order, company = {} }) => {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Info */}
        <View style={styles.companyBlock}>
          <Text style={styles.companyName}>
            {company.name || "ETS Louaguef Sayah"}
          </Text>
          {company.address && (
            <Text style={styles.companyLine}>{company.address}</Text>
          )}
          {company.phone && (
            <Text style={styles.companyLine}>Tél: {company.phone}</Text>
          )}
        </View>

        {/* Receipt Title */}
        <Text style={styles.receiptTitle}>Reçu de Commande</Text>

        {/* Order Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>N° :</Text>
          <Text>{order._id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date :</Text>
          <Text>{fmtDateTime(order.createdAt)}</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Client :</Text>
            <Text>{order.user?.name || "—"}</Text>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.th, styles.colProduct]}>Produit</Text>
            <Text style={[styles.th, styles.colQty]}>Qté</Text>
            <Text style={[styles.th, styles.colPU]}>P.U.</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {items.map((item, idx) => {
            const name = item.product?.name || "—";
            const qty = item.quantity || 0;
            const pu = item.unitPrice || 0;
            const total = pu * qty;
            return (
              <View style={styles.tableRow} key={idx}>
                <Text style={[styles.td, styles.colProduct]}>{name}</Text>
                <Text style={[styles.td, styles.colQty]}>{qty}</Text>
                <Text style={[styles.td, styles.colPU]}>
                  {fmtNumber(pu)} DZD
                </Text>
                <Text style={[styles.td, styles.colTotal]}>
                  {fmtNumber(total)} DZD
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total :</Text>
            <Text>{fmtNumber(order.totalPrice)} DZD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Montant payé :</Text>
            <Text>{fmtNumber(order.amountPaid)} DZD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalDue}>Reste à payer :</Text>
            <Text style={styles.totalDue}>
              {fmtNumber(
                Math.max(
                  0,
                  order.remainingDebt ?? order.totalPrice - order.amountPaid
                )
              )}{" "}
              DZD
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Dette totale :</Text>
            <Text style={styles.totalLabel}>
              {fmtNumber(order.user?.totalDebt ?? 0)} DZD
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Merci pour votre confiance. Conservez ce reçu pour vos dossiers.
        </Text>
      </Page>
    </Document>
  );
};

export default OrderReceiptPDF;
