import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import amiriFont from "../../assets/fonts/Amiri-Regular.ttf";

Font.register({ family: "Amiri", src: amiriFont });

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Amiri",
    color: "#000",
    direction: "ltr",
  },

  companyBlock: {
    marginBottom: 20,
    textAlign: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 10,
    marginBottom: 1,
  },

  receiptTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 12,
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
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },

  th: {
    fontWeight: "bold",
    fontSize: 10,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  td: {
    fontSize: 10,
    padding: 4,
    borderTop: "1 solid #000",
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  colProduct: { width: "50%", textAlign: "left" },
  colQty: { width: "15%" },
  colPU: { width: "17%" },
  colTotal: { width: "18%", borderRight: "0" },

  totalsBlock: {
    width: "60%",
    marginLeft: "auto",
    marginTop: 10,
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
    marginTop: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#555",
  },
});

// Helpers
const fmtNumber = (n) =>
  typeof n === "number" ? n.toLocaleString("fr-DZ") : "—";

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-DZ");
};

const OrderReceiptPDF = ({ order = {}, company = {} }) => {
  const {
    _id,
    createdAt,
    user = {},
    items = [],
    totalPrice = 0,
    amountPaid = 0,
    remainingDebt,
  } = order;

  const debtValue = remainingDebt ?? totalPrice - amountPaid;

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

        {/* Title */}
        <Text style={styles.receiptTitle}>Reçu de Commande</Text>

        {/* Order Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>N° :</Text>
          <Text>{_id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date :</Text>
          <Text>{fmtDateTime(createdAt)}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Client :</Text>
            <Text>{user.name || "—"}</Text>
          </View>
        </View>

        {/* Product Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.th, styles.colProduct]}>Produit</Text>
            <Text style={[styles.th, styles.colQty]}>Qté</Text>
            <Text style={[styles.th, styles.colPU]}>P.U.</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>

          {/* Rows */}
          {items.map((item, idx) => {
            const name = item.product?.name || "—";
            const qty = item.quantity ?? 0;
            const pu = item.unitPrice ?? 0;
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
            <Text>{fmtNumber(totalPrice)} DZD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Montant payé :</Text>
            <Text>{fmtNumber(amountPaid)} DZD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalDue}>Reste à payer :</Text>
            <Text style={styles.totalDue}>{fmtNumber(Math.max(0, debtValue))} DZD</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Dette totale :</Text>
            <Text style={styles.totalLabel}>
              {fmtNumber(user.totalDebt ?? 0)} DZD
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
