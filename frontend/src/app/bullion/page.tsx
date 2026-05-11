import BullionContent from './BullionContent';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          <BullionContent />
        </div>
      </main>
    </div>
  );
};

export default HomePage;