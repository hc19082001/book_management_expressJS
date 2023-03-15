export default function numberToVND(number) {
    return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
