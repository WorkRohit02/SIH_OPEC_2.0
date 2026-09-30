import { useParams } from 'react-router-dom';
import { useStore } from '../mock/store.jsx';
import { PageTitle, EmptyState } from '../components/index.jsx';
import RecordDetail from '../components/RecordDetail.jsx';

export default function Detail() {
  const { id } = useParams(); const { records } = useStore();
  const rec = records.find((r) => r.id === id);
  return (
    <div className="page"><PageTitle title="Evidence Detail" backTo="/evidence" />
      {rec ? <RecordDetail record={rec} /> : <EmptyState title="Record not found" body={`No record with ID ${id} is stored on this device.`} />}</div>
  );
}
