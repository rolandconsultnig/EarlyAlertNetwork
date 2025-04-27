import TransportationInfo from '@/components/transportation/TransportationInfo';

export default function TransportationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transportation & Logistics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor transportation infrastructure and plan evacuation routes for crisis response
          </p>
        </div>
      </div>

      <TransportationInfo />
    </div>
  );
}