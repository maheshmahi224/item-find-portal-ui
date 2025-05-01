
import { LostFoundProvider } from "@/context/LostFoundContext";
import Layout from "@/components/Layout";

const Index = () => {
  return (
    <LostFoundProvider>
      <Layout />
    </LostFoundProvider>
  );
};

export default Index;
