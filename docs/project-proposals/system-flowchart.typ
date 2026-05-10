#import "@preview/cetz:0.4.2" as cetz

#let research-system-flowchart() = {
  let labels = (
    "Research objective and scope",
    "Country case selection",
    "Indicator and evidence integration",
    "Failure-type and driver coding",
    "Cross-case comparative analysis",
    "Strategy and policy recommendations",
  )

  let node-fill = rgb("#EEF3FF")
  let node-stroke = rgb("#2F4F90")
  let node-text = rgb("#1A2A44")
  let edge-stroke = rgb("#4C64A3")

  figure(
    placement: none,
    caption: [SDG 9 research system.],
    cetz.canvas({
      import cetz.draw: content, line, rect

      let x0 = 0
      let y0 = 0
      let w = 5.8
      let h = 0.9
      let gap = 0.45

      for (idx, label) in labels.enumerate() {
        let top = y0 - idx * (h + gap)
        let bottom = top - h
        let cx = x0 + w / 2

        rect(
          (x0, top),
          (x0 + w, bottom),
          fill: node-fill,
          stroke: 0.9pt + node-stroke,
        )

        content(
          (cx, (top + bottom) / 2),
          anchor: "center",
          [#text(size: 9.2pt, weight: "semibold", fill: node-text)[#label]],
        )

        if idx < labels.len() - 1 {
          let next-top = y0 - (idx + 1) * (h + gap)
          let tip-y = next-top + 0.04
          let stem-end = tip-y + 0.15

          line((cx, bottom), (cx, stem-end), stroke: 0.9pt + edge-stroke)
          line((cx - 0.1, tip-y + 0.1), (cx, tip-y), stroke: 0.9pt + edge-stroke)
          line((cx + 0.1, tip-y + 0.1), (cx, tip-y), stroke: 0.9pt + edge-stroke)
        }
      }
    }),
  )
}
