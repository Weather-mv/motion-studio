import React, {useMemo} from 'react';
import {scaleBand, scaleLinear} from 'd3-scale';
import {curveMonotoneX, line} from 'd3-shape';
import {evolvePath} from '@remotion/paths';
import {useMotion} from '../core/motion';
import {SceneFrame, alpha} from '../core/primitives';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';
import {sceneSchemas} from './schemas';

// Data comes only from props. One axis, zero baseline, thin marks, a legend only for two or more series.
// Value labels are selective: the highlighted label if there is one, otherwise each series' highest value.
export const Chart: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.chart.parse(props), [props]);
  const stage = useStage();
  const {brand} = useTheme();
  const {safe, unit, type: t} = stage;
  const c = brand.colors;
  const m = useMotion();
  const slots = [c.accent, c.secondary, c.muted]; // fixed order: colour follows the series, never its rank
  const fmt = (v: number) => `${p.prefix ?? ''}${v.toLocaleString('en-US')}${p.suffix ?? ''}`;

  const titleH = 150 * unit;
  const legendH = p.series.length > 1 ? 56 * unit : 0;
  const sourceH = 50 * unit;
  const W = safe.width;
  const H = Math.min(safe.height - titleH - legendH - sourceH, W * 1.05);
  const margin = {top: 44 * unit, right: 16 * unit, bottom: 56 * unit, left: 96 * unit};
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const all = p.series.flatMap((s) => s.values);
  const y = scaleLinear().domain([0, Math.max(...all, 0)]).nice(4).range([plotH, 0]);
  const x = scaleBand<number>().domain(p.labels.map((_, i) => i)).range([0, plotW]).paddingInner(0.28).paddingOuter(0.14);
  const build = m.progress(p.startSec, p.buildSec, 'move');
  const fadeOthers = p.highlight !== undefined ? m.progress(p.startSec + p.buildSec, 0.4) : 0;
  const dim = (i: number) => (p.highlight !== undefined && i !== p.highlight ? 1 - 0.65 * fadeOthers : 1);
  const label = (s: {values: number[]}, i: number) => (p.highlight !== undefined ? i === p.highlight : s.values[i] === Math.max(...s.values));
  const textProps = {fontFamily: brand.fonts.body, fontSize: t.small};
  const labelOpacity = m.progress(p.startSec + p.buildSec * 0.8, 0.3);

  return (
    <SceneFrame style={{justifyContent: 'center'}}>
      <div style={{height: titleH, display: 'flex', alignItems: 'flex-start', fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: t.h2, lineHeight: 1.12, ...m.enter(0)}}>{p.title}</div>
      {legendH ? (
        <div style={{height: legendH, display: 'flex', gap: 36 * unit, alignItems: 'center', fontSize: t.small, opacity: m.progress(0.1)}}>
          {p.series.map((s, i) => (
            <div key={s.name} style={{display: 'flex', alignItems: 'center', gap: 12 * unit}}>
              <div style={{width: 22 * unit, height: 22 * unit, borderRadius: 4 * unit, background: slots[i]}} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      ) : null}
      <svg width={W} height={H} style={{display: 'block', overflow: 'visible'}}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {y.ticks(4).map((v) => (
            <g key={v}>
              <line x1={0} x2={plotW} y1={y(v)} y2={y(v)} stroke={alpha(c.muted, v === 0 ? 0.7 : 0.2)} strokeWidth={Math.max(1, unit)} />
              <text x={-14 * unit} y={y(v)} dy="0.35em" textAnchor="end" fill={c.muted} {...textProps}>{fmt(v)}</text>
            </g>
          ))}
          {p.labels.map((l, i) => (
            <text key={i} x={(x(i) ?? 0) + x.bandwidth() / 2} y={plotH + 38 * unit} textAnchor="middle" fill={c.text} {...textProps}>{l}</text>
          ))}
          {p.type === 'bar'
            ? p.series.map((s, si) => {
                const inner = x.bandwidth() / p.series.length;
                return s.values.map((v, i) => {
                  const local = Math.min(1, Math.max(0, build * (p.labels.length + 1) - i));
                  const h = (plotH - y(v)) * local;
                  const bx = (x(i) ?? 0) + inner * si + unit;
                  const bw = Math.max(2, inner - 2 * unit);
                  const r = Math.min(4 * unit, h);
                  return (
                    <g key={`${si}-${i}`} opacity={dim(i)}>
                      <path d={`M${bx},${plotH}V${plotH - h + r}Q${bx},${plotH - h} ${bx + r},${plotH - h}H${bx + bw - r}Q${bx + bw},${plotH - h} ${bx + bw},${plotH - h + r}V${plotH}Z`} fill={slots[si]} />
                      {label(s, i) ? <text x={bx + bw / 2} y={plotH - h - 14 * unit} textAnchor="middle" fill={c.text} fontWeight={700} opacity={labelOpacity} {...textProps}>{fmt(v)}</text> : null}
                    </g>
                  );
                });
              })
            : p.series.map((s, si) => {
                const px = (i: number) => (x(i) ?? 0) + x.bandwidth() / 2;
                const d = line<number>().x((_, i) => px(i)).y((v) => y(v)).curve(curveMonotoneX)(s.values) ?? '';
                const {strokeDasharray, strokeDashoffset} = evolvePath(build, d);
                return (
                  <g key={si}>
                    <path d={d} fill="none" stroke={slots[si]} strokeWidth={4 * unit} strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
                    {s.values.map((v, i) => {
                      const shown = build >= i / Math.max(1, s.values.length - 1) - 1e-6;
                      return shown ? (
                        <g key={i} opacity={dim(i)}>
                          <circle cx={px(i)} cy={y(v)} r={7 * unit} fill={slots[si]} stroke={c.bg} strokeWidth={2 * unit} />
                          {label(s, i) ? <text x={px(i)} y={y(v) - 20 * unit} textAnchor="middle" fill={c.text} fontWeight={700} opacity={labelOpacity} {...textProps}>{fmt(v)}</text> : null}
                        </g>
                      ) : null;
                    })}
                  </g>
                );
              })}
        </g>
      </svg>
      <div style={{height: sourceH, display: 'flex', alignItems: 'flex-end', fontSize: t.small, color: c.muted, opacity: m.progress(0.2)}}>Source: {p.source}</div>
    </SceneFrame>
  );
};
