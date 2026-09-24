import LinearGauge from './bklit/LinearGauge';

export default function BuildPipelineChart({ stats, onSelect }) {
  const stages = [
    ['paid', 'Awaiting build', stats.awaiting_build, '#e8b800'],
    ['in_build', 'In production', stats.building_now, '#f4a866'],
    ['quality_check', 'Quality check', stats.quality_now, '#b7a2fb'],
    ['shipped', 'In transit', stats.in_transit, '#64c9dd'],
  ];
  const available = stages.every(([, , value]) => value !== undefined && value !== null);
  const total = stages.reduce((sum, [, , count]) => sum + (Number(count) || 0), 0);
  return <section className="bklit-pipeline" aria-labelledby="pipeline-title">
    <div className="pipeline-heading"><p className="eyebrow">Live workload</p><h2 id="pipeline-title">Every build.<br />One clear view.</h2>
      <p>{available ? <><strong>{total}</strong> {total === 1 ? 'active order' : 'active orders'} across production and delivery.</> : 'Current-stage counts will appear when the updated API is available.'}</p>
      {available && <span className="pipeline-hint">Select a stage to view its orders ↗</span>}
    </div>
    <div className="bklit-bars">{available && stages.map(([id, label, count, color]) => {
      const value = Number(count) || 0;
      return <button type="button" className="bklit-bar-row" key={id} onClick={() => onSelect(id)} aria-label={`View ${label.toLowerCase()}: ${value} orders`}>
        <span>{label}</span><LinearGauge value={total ? value / total * 100 : 0} color={color} label={`${value} of ${total} active orders`} /><strong>{value}</strong>
      </button>;
    })}{available && total === 0 && <p className="pipeline-empty">No active orders right now. New paid orders will appear here.</p>}</div>
  </section>;
}
