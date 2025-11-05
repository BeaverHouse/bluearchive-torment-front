import Image from "next/image";

function BuyMeACoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com/haulrest"
      target="_blank"
      rel="noreferrer"
      style={{ marginTop: "40px", marginBottom: "10px" }}
    >
      <Image src="/bmc-button.png" alt="buy me a coffee" width={200} height={56} />
    </a>
  );
}

export default BuyMeACoffeeButton;
