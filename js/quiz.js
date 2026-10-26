const QUIZ = [
  {
    q: 'The PRIMARY purpose of statistical process control is to:',
    options: [
      'Inspect 100% of product before shipping',
      'Distinguish common-cause from special-cause variation so the correct action can be taken',
      'Reduce specification limits to improve yields',
      'Replace engineering judgment with calculator output'
    ],
    answer: 1,
    why: 'SPC exists to separate the two kinds of variation. Each kind requires a different — and correct — response: management changes for common causes, immediate action for special causes.'
  },
  {
    q: 'Walter Shewhart of Bell Labs is best known for developing:',
    options: [
      'The Baldrige criteria',
      'The control chart and the concept of statistical control',
      'The Ishikawa diagram',
      'The FMEA methodology'
    ],
    answer: 1,
    why: 'Shewhart created the control chart in the 1920s and defined statistical control — the foundation of SPC. Ishikawa, Feigenbaum, and Baldrige came later.'
  },
  {
    q: 'Deming\'s funnel experiment demonstrates that:',
    options: [
      '100% inspection is the most economical approach',
      'Subgroup size should always be 5',
      'Tightening specifications improves quality',
      'Adjusting a stable process based on single readings (tampering) increases variation'
    ],
    answer: 3,
    why: 'The funnel experiment shows that reacting to common-cause noise — tweaking settings after every reading — makes output worse. Act only on genuine signals.'
  },
  {
    q: 'According to Juran\'s Pareto principle applied to quality, approximately what share of losses comes from a vital few causes?',
    options: [
      '50/50',
      '10/90',
      'All causes contribute equally',
      '20% of causes cause 80% of losses'
    ],
    answer: 3,
    why: 'The 80/20 rule: roughly 80% of quality losses come from 20% of the causes — so improvement effort should focus on the vital few, not the trivial many.'
  },
  {
    q: 'A process is in statistical control but Cpk = 0.7. Who should act, and how?',
    options: [
      'The operator — adjust the machine every shift',
      'Management / the process owner — change the process design to reduce variation or recenter the mean',
      'The inspector — sort 100% of product',
      'No one — an in-control process is fine'
    ],
    answer: 1,
    why: 'In-control means the system is stable at its current design. Common-cause variation can only be reduced by changing the system (tools, method, material, training) — management\'s job.'
  },
  {
    q: 'Control limits and specification limits are:',
    options: [
      'Specification limits are set from the data; control limits from the print',
      'The same thing expressed in different units',
      'Different — control limits come from the process voice; specification limits come from the customer/design voice',
      'Both calculated from the tolerance width'
    ],
    answer: 2,
    why: 'Control limits describe what the process actually does (process voice); specifications describe what the customer requires (design voice). Confusing them is one of the most common SPC errors.'
  },
  {
    q: 'An experienced operator says, "The last reading looks high, so I adjusted the setting." In SPC terms this is called:',
    options: [
      'A special-cause reaction plan',
      'Continuous improvement',
      'Rational subgrouping',
      'Tampering — and it increases variation'
    ],
    answer: 3,
    why: 'Reacting to a single point inside the limits is tampering (Deming\'s funnel). Adjustments based on noise add variation; act only when a signal rule fires.'
  },
  {
    q: 'Why does 100% inspection NOT guarantee quality?',
    options: [
      'Inspectors miss defects, and 100% inspection does nothing to improve the process that created the defects',
      'It only works for variable data',
      'Regulations forbid it',
      'It does guarantee quality — it is simply expensive'
    ],
    answer: 0,
    why: 'Human inspectors miss defects (typically 20%+ escape), and inspection only sorts output — it does not remove causes. Prevention through process improvement is always superior.'
  },
  {
    q: 'A process "in statistical control" means:',
    options: [
      'Every part meets specification',
      'The process is stable and predictable — variation is due only to common causes',
      'The control limits are equal to the specification limits',
      'Cpk is greater than 1.33'
    ],
    answer: 1,
    why: 'Control describes stability and predictability, not conformance to specs. A stable process may still be entirely incapable of meeting specifications.'
  },
  {
    q: 'Statistical control limits are conventionally set at ±3 sigma because:',
    options: [
      'The normal distribution ends at three sigma',
      'Three standard deviations equal one inch on the chart',
      'Shewhart found 3-sigma gave the best economic balance between false alarms and detecting real upsets',
      'ISO requires exactly three sigma'
    ],
    answer: 2,
    why: 'Shewhart chose 3-sigma as the economic trade-off: wider limits miss real signals; narrower limits produce too many false alarms. The normal curve extends beyond 3 sigma — about 0.27% of points fall outside.'
  },
  {
    q: 'SPC is best described as:',
    options: [
      'A paperwork exercise for audits only',
      'A replacement for engineering standards',
      'Purely reactive — find bad lots after production',
      'Both reactive (respond to special causes) and proactive (reduce future defects by improving the system)'
    ],
    answer: 3,
    why: 'SPC reacts to special causes as they occur and, by exposing common-cause variation, guides proactive system improvement — the whole point of "control the process, not the product."'
  },
  {
    q: 'The PDCA (Plan-Do-Check-Act) cycle is attributed to:',
    options: [
      'Kaoru Ishikawa',
      'W. Edwards Deming (based on Shewhart\'s work)',
      'Philip Crosby',
      'Armand Feigenbaum'
    ],
    answer: 1,
    why: 'The cycle originated with Shewhart and was popularized by Deming as the scientific method for improvement. Ishikawa is known for cause-and-effect diagrams; Crosby for zero defects.'
  },
  {
    q: 'Deming\'s "system of profound knowledge" emphasizes that quality problems are primarily caused by:',
    options: [
      'Workers not trying hard enough',
      'The system that management designs and operates',
      'Suppliers who ship bad material',
      'Customers with unreasonable specifications'
    ],
    answer: 1,
    why: 'Deming held that ~85-94% of problems belong to the system (management\'s responsibility); worker performance depends largely on how the system treats them. Blaming workers for system problems is futile.'
  },
  {
    q: 'A "capable" process is one that:',
    options: [
      'Has control limits inside the specifications',
      'Is in statistical control',
      'Meets customer specifications with a known, acceptable margin — assessed by Cp/Cpk or Pp/Ppk',
      'Has never produced a defect'
    ],
    answer: 2,
    why: 'Control (stability) and capability (meeting specs) are different questions. Capability indices compare process spread and centering against specification limits — but only meaningfully on a stable process.'
  },
  {
    q: 'Which statement about "zero defects" (Crosby) is most accurate in an SPC context?',
    options: [
      'It proves common-cause variation can be zero',
      'It replaces control charts',
      'It means motivating workers to be perfect',
      'It is a performance standard — do it right the first time — supported by prevention, not inspection'
    ],
    answer: 3,
    why: 'Crosby\'s zero defects is a management philosophy of conformance and prevention. SPC complements it: special causes are eliminated, common causes are reduced — but statistical noise never truly reaches zero.'
  },
  {
    q: 'Five bottles are measured back-to-back at one machine, one shift. These five readings form a subgroup that is:',
    options: [
      'An irrational subgroup — the readings are too similar',
      'A random sample of the whole process',
      'Invalid because n = 5 is too small',
      'A rational subgroup — it captures short-term, common-cause variation'
    ],
    answer: 3,
    why: 'Rational subgrouping holds conditions nearly constant within the subgroup so the range estimates only natural (common-cause) variation. Time is allowed to vary BETWEEN subgroups to expose special causes.'
  },
  {
    q: 'Which chart is appropriate for variable data with subgroups of n = 5 collected every hour?',
    options: [
      'X̄–R chart',
      'p chart',
      'c chart',
      'I–MR chart'
    ],
    answer: 0,
    why: 'Continuous (variable) data in subgroups of 2-10 → X̄–R. Attribute data → p/np/c/u; one reading per period → I–MR.'
  },
  {
    q: 'Variable data with subgroups of n = 12 are collected. Range becomes unreliable for estimating variation at this size. The BEST choice is:',
    options: [
      'u chart',
      'X̄–R chart',
      'X̄–S chart',
      'np chart'
    ],
    answer: 2,
    why: 'For subgroups above about 10, the range ignores most of the data; the standard deviation (s) uses every value, so X̄–S is preferred.'
  },
  {
    q: 'One measurement is taken per shift, and the operator wants to chart it. The correct chart is:',
    options: [
      'Individuals and moving range (I–MR)',
      'c chart',
      'X̄–R',
      'p chart'
    ],
    answer: 0,
    why: 'With one value per period there is no within-subgroup range — chart individuals (I) with the moving range (MR) between consecutive points to estimate variation.'
  },
  {
    q: 'An assembly line counts defectives (good/not good) from lots of constant size n = 85. The best chart is:',
    options: [
      'np chart',
      'c chart',
      'u chart',
      'p chart'
    ],
    answer: 0,
    why: 'Defectives (binomial) with CONSTANT sample size → np chart (counts of defectives, easier to read). If n varied, use the p chart (proportion).'
  },
  {
    q: 'Defectives are counted from samples whose size varies between lots. The correct chart is:',
    options: [
      'np chart',
      'p chart',
      'c chart',
      'X̄ chart'
    ],
    answer: 1,
    why: 'With varying n, the count of defectives no longer has a constant expected value — chart the PROPORTION defective (p chart) with per-sample limits.'
  },
  {
    q: 'On a car door, every door has the same inspection area, and you count scratches and dents. The BEST chart is:',
    options: [
      'u chart',
      'p chart',
      'np chart',
      'c chart'
    ],
    answer: 3,
    why: 'Counting DEFECTS (not defectives) on a constant inspection unit → c chart (Poisson). If the inspected area/unit varied, use the u chart.'
  },
  {
    q: 'A textile mill inspects rolls of varying length and counts flaws. The correct chart is:',
    options: [
      'np chart',
      'I–MR chart',
      'c chart',
      'u chart'
    ],
    answer: 3,
    why: 'Defects per unit where the exposure (length, area, volume) varies → u chart (defects per constant unit), with limits that vary by sample size.'
  },
  {
    q: 'Rational subgrouping primarily serves to:',
    options: [
      'Maximize the chance that within-subgroup variation reflects only common causes, while time-to-time changes appear BETWEEN subgroups',
      'Make the control limits narrower',
      'Satisfy customer audit requirements',
      'Reduce the amount of data collected'
    ],
    answer: 0,
    why: 'Subgroups should be internally homogeneous (common causes only) and allow process change over time. This maximizes the chart\'s ability to detect special causes.'
  },
  {
    q: 'When interpreting an X̄–R chart, you should FIRST examine:',
    options: [
      'The X̄ chart',
      'The R (or s) chart — if within-subgroup variation is out of control, the X̄ limits are unreliable',
      'The capability indices',
      'The histogram'
    ],
    answer: 1,
    why: 'The R/s chart validates the variation estimate used to compute X̄ limits. If R is unstable, the X̄ chart\'s limits are meaningless — fix the R chart issues first.'
  },
  {
    q: 'Control limits on an X̄ chart are computed from:',
    options: [
      'The customer\'s tolerance width',
      'The specification limits divided by 3',
      'The process average and an estimate of standard deviation (from R̄/d₂ or s̄/c₄)',
      'The highest and lowest individual readings'
    ],
    answer: 2,
    why: 'X̄ chart limits: X̄̄ ± 3σ̂/√n, with σ̂ estimated from the average range (R̄/d₂) or average s (s̄/c₄). Specs play no role in control limits.'
  },
  {
    q: 'A point on an X̄ chart exceeds the upper control limit. The BEST initial action is to:',
    options: [
      'Widen the limits so it fits',
      'Increase the subgroup size',
      'Delete the point and recalculate limits',
      'Investigate for a special cause; if found and corrected, consider excluding it when re-baselining'
    ],
    answer: 3,
    why: 'Out-of-limit points signal a special cause. Find and remove the cause; only then may the point be excluded when recalculating baseline limits. Deleting points to "clean" a chart is dishonest SPC.'
  },
  {
    q: 'Nine consecutive points all fall above the centerline but inside the limits. This signals:',
    options: [
      'A sustained mean shift (run rule / Nelson rule 2)',
      'Improved capability',
      'Stratification',
      'Nothing — they are inside the limits'
    ],
    answer: 0,
    why: 'A run of 8-9 points on one side of the CL indicates the mean has shifted even though no point exceeded a limit. Investigate for a special cause.'
  },
  {
    q: 'Six consecutive points steadily increasing on a control chart indicate:',
    options: [
      'A trend — often tool wear, fouling, or drift; investigate',
      'Random common-cause behavior',
      'An out-of-control R chart',
      'The subgroup size is wrong'
    ],
    answer: 0,
    why: 'A run of 6 increasing (or decreasing) points violates the trend rule. Common causes: tool wear, temperature drift, reagent depletion — plan corrective action.'
  },
  {
    q: 'Fourteen consecutive points alternating up and down indicate:',
    options: [
      'Over-control',
      'Excellent control',
      'A systematic or cyclical pattern (e.g., two alternating machines, day/night) — investigate',
      'A mean shift'
    ],
    answer: 2,
    why: 'Strict alternation is not randomness — it usually comes from two sources alternating (machines, operators, lots) or a systematic adjustment cycle.'
  },
  {
    q: 'Two of three consecutive points beyond 2 sigma (on the same side) signal:',
    options: [
      'The need to recalculate the centerline',
      'An R chart problem',
      'A likely process mean shift — apply the zone rule and investigate',
      'A harmless sampling fluctuation'
    ],
    answer: 2,
    why: 'This is a Western Electric / Nelson zone rule (rule 5). Points this far from the CL are rare under pure common causes — treat as a probable shift.'
  },
  {
    q: 'Fifteen consecutive points all fall within 1 sigma of the centerline (Zone C). This pattern suggests:',
    options: [
      'Stratification — two or more mixed streams or a miscalculated limit set hiding variation',
      'A mean shift',
      'Autocorrelation',
      'Outstanding capability'
    ],
    answer: 0,
    why: 'Too many points hugging the CL means the variation estimate is inflated (e.g., limits computed from data containing big shifts, or subgroups mixing fast/slow streams). The chart has lost sensitivity.'
  },
  {
    q: 'Eight consecutive points fall on both sides of the centerline with NONE in Zone C (within 1 sigma). This signals:',
    options: [
      'A mixture distribution — two populations (machines, materials, suppliers) are being charted together',
      'Perfect common-cause behavior',
      'A process centered exactly on target',
      'Sample size too large'
    ],
    answer: 0,
    why: 'Avoidance of the middle zone means a bimodal/mixture process. Either stratify the streams onto separate charts or find why two populations exist.'
  },
  {
    q: 'Control limits should be recalculated when:',
    options: [
      'Whenever a new operator starts',
      'Every month, automatically',
      'A permanent, verified process change has occurred (new tooling, method, or eliminated special cause) — with documented justification',
      'Whenever a point goes out of limits'
    ],
    answer: 2,
    why: 'Routine recalculation destroys the baseline and hides drift. Re-baseline only after verified permanent change; keep the old limits for comparison.'
  },
  {
    q: 'Stratification on a control chart (too many points near the CL) most often results from:',
    options: [
      'Plotting R instead of s',
      'Too frequent sampling',
      'Sampling subgroups that mix multiple process streams, or limits computed from data with unremoved shifts',
      'Using n = 5 instead of n = 4'
    ],
    answer: 2,
    why: 'Mixed streams inflate within-subgroup variation, pushing limits outward; unremoved shifts inflate the sigma estimate. Both make the chart insensitive.'
  },
  {
    q: 'Autocorrelated data (each reading related to the previous) causes:',
    options: [
      'Invalid limits and excessive false alarms — model the time dependence or chart residuals / use time-series methods',
      'Higher Cpk values',
      'No problem for Shewhart charts',
      'Narrower control limits'
    ],
    answer: 0,
    why: 'Shewhart rules assume independent points. Autocorrelation makes limits too narrow for the actual process behavior, generating false signals. Options: reduce sampling frequency, model AR terms, or chart residuals.'
  },
  {
    q: 'EWMA (Exponentially Weighted Moving Average) charts are BEST suited for detecting:',
    options: [
      'Large sudden shifts of 3 sigma or more',
      'Small sustained shifts (about 0.5 to 1.5 sigma)',
      'Changes in process variance only',
      'Attribute defects per unit'
    ],
    answer: 1,
    why: 'EWMA accumulates information from all past points with exponential weighting, making it far more sensitive than Shewhart charts to small persistent shifts.'
  },
  {
    q: 'In the EWMA statistic z = λ·x + (1−λ)·z_prev, a SMALLER lambda λ means:',
    options: [
      'A larger subgroup size',
      'Less smoothing and faster reaction to every point',
      'More smoothing (more weight on history) — better for small shifts, slower for large ones',
      'Wider control limits'
    ],
    answer: 2,
    why: 'Small λ (e.g., 0.05-0.2) smooths heavily, emphasizing history — ideal for small shifts. λ near 1 behaves like a Shewhart chart reacting to each new point.'
  },
  {
    q: 'A CUSUM (cumulative sum) chart detects small shifts by:',
    options: [
      'Averaging ranges of consecutive subgroups',
      'Counting defectives per lot',
      'Plotting each individual point against 3-sigma limits',
      'Accumulating deviations from target until the running sum crosses a decision threshold'
    ],
    answer: 3,
    why: 'CUSUM sums signed deviations from target; small persistent shifts add up until the cumulative sum signals. It is the classic tool for detecting 1-1.5 sigma shifts quickly.'
  },
  {
    q: 'A classic p chart shows many out-of-control signals, and analysis reveals σz (overdispersion factor) = 2.1. The BEST response is:',
    options: [
      'Delete the out-of-control points',
      'Increase subgroup size until the chart passes',
      'Convert to an X̄ chart',
      'Switch to a Laney p′ chart — limits widen by σz — and investigate why defect counts cluster'
    ],
    answer: 3,
    why: 'σz ≫ 1 means counts vary more than binomial theory allows (overdispersion — clustering by lot, operator, time). Laney p′ corrects the limits; finding the clustering cause is the real improvement.'
  },
  {
    q: 'An np chart requires that:',
    options: [
      'The data be normally distributed',
      'The sample size be constant for every subgroup',
      'Defects (not defectives) be counted',
      'n be larger than 50'
    ],
    answer: 1,
    why: 'np charts plot COUNTS of defectives, which are only comparable across subgroups when n is constant. If n varies, use the p chart.'
  },
  {
    q: 'p charts and np charts are based on which distribution?',
    options: [
      'Exponential',
      'Poisson',
      'Binomial',
      'Normal'
    ],
    answer: 2,
    why: 'Defectives (go/no-go) follow the binomial distribution. c and u charts (counts of defects) follow the Poisson.'
  },
  {
    q: 'On a c chart the centerline equals:',
    options: [
      'The total defectives divided by total parts',
      'Three standard deviations of the count',
      'The average number of defects per inspection unit (c̄)',
      'The upper control limit divided by 2'
    ],
    answer: 2,
    why: 'The c chart centerline is c̄ = total defects / number of units, with limits c̄ ± 3√c̄ (Poisson).'
  },
  {
    q: 'When sample size varies on a p chart, what happens to the control limits?',
    options: [
      'They vary from sample to sample (limits calculated per n)',
      'They are always ±3 sigma of the largest n',
      'They become specification limits',
      'They stay constant'
    ],
    answer: 0,
    why: 'The standard error of p depends on n, so limits must be computed for each sample\'s n — most SPC software plots a limit "staircase."'
  },
  {
    q: 'Pre-control differs from SPC control charts in that pre-control:',
    options: [
      'Uses specification limits to judge the process and ignores process history and statistical control',
      'Uses 3-sigma limits from process data',
      'Requires 25 subgroups before use',
      'Is more sensitive to small shifts than EWMA'
    ],
    answer: 0,
    why: 'Pre-control divides the spec tolerance into zones and judges each reading against it — it has no process baseline and is not recommended as an SPC method.'
  },
  {
    q: 'For I–MR charts, sigma is estimated from the moving range using:',
    options: [
      'The specification width',
      'R̄/d₂ with d₂ = 1.128 for n = 2',
      'R̄/c₄',
      's̄/d₂'
    ],
    answer: 1,
    why: 'The moving range of two consecutive individuals has an effective subgroup size of 2, so σ̂ = MR̄/1.128 (d₂ for n=2).'
  },
  {
    q: 'Increasing subgroup size n on an X̄ chart will:',
    options: [
      'Leave limits unchanged',
      'Only affect the R chart',
      'Widen the control limits',
      'Narrow the control limits (√n effect) — increasing sensitivity to small mean shifts'
    ],
    answer: 3,
    why: 'X̄ limits are ±3σ/√n — larger n narrows them, detecting smaller shifts, at higher sampling cost. This is the design trade-off.'
  },
  {
    q: 'A "defect" versus a "defective" is best described as:',
    options: [
      'A defect is one nonconformity on a unit; a defective unit has one or more defects',
      'A defective is a unit out of spec; a defect is a chart violation',
      'Defects apply to variable data only',
      'They are synonyms'
    ],
    answer: 0,
    why: 'One door can have three scratches (3 defects) yet still be a good door (not defective). Defects → c/u charts (Poisson); defectives → p/np charts (binomial).'
  },
  {
    q: 'The fraction of points expected to fall outside 3-sigma limits from pure common-cause variation is approximately:',
    options: [
      '0.27% (about 1 in 370)',
      '5%',
      '10%',
      '0% — no point should ever fall outside'
    ],
    answer: 0,
    why: 'Under a normal distribution, ~99.73% of points fall inside ±3σ, leaving ~0.27% outside — so a false alarm about every 370 points is the designed-in cost of 3-sigma limits.'
  },
  {
    q: 'For rare events (e.g., 1-2 occurrences per month), the BEST modern chart choice is often:',
    options: [
      'A c chart',
      'A standard p chart with n = 1000',
      'A g chart (geometric) or T chart, designed for time or units between rare events',
      'An X̄–R chart of monthly counts'
    ],
    answer: 2,
    why: 'Poisson/binomial charts lose power at very low rates. Geometric (g) and time-between (T) charts model the spacing between rare events directly.'
  },
  {
    q: 'The centerline of a u chart represents:',
    options: [
      'The specification target',
      'The moving range average',
      'Average defects per unit (c̄/n̄) across samples',
      'Average defective fraction'
    ],
    answer: 2,
    why: 'The u chart plots defects per unit; its centerline is the overall average defects/unit, with limits ū ± 3√(ū/n) that vary with sample size.'
  },
  {
    q: 'A process is charted and shows no rule violations for 50 subgroups. The BEST statement is:',
    options: [
      'The process has been in statistical control over the period studied — continue monitoring; conclusions apply only while the process stays unchanged',
      'No special causes can occur in the future',
      'Cpk must exceed 1.33',
      'The process is proven to be capable forever'
    ],
    answer: 0,
    why: 'Control is a statement about the past under current conditions. New tooling, materials, or operators reintroduce special causes — keep charting.'
  },
  {
    q: 'The MOST common reason a control chart fails to detect a real process problem is:',
    options: [
      'Limits too narrow',
      'A poor measurement system and/or incorrect rational subgrouping',
      'Using n = 4 instead of n = 5',
      'Plotting on paper instead of software'
    ],
    answer: 1,
    why: 'Garbage data in, garbage signals out. Verify the gauge (Gage R&R) and subgroup structure before trusting any chart.'
  },
  {
    q: 'Cp is calculated as:',
    options: [
      '(USL − LSL) / (2σ)',
      '(USL − LSL) / (6σ)',
      '(USL − μ) / (3σ)',
      'μ / σ'
    ],
    answer: 1,
    why: 'Cp compares tolerance width to 6-sigma process spread. It measures potential — it ignores centering (that is Cpk\'s job).'
  },
  {
    q: 'Cpk differs from Cp in that Cpk:',
    options: [
      'Requires at least 100 data points',
      'Compares Pp to Ppk',
      'Uses overall sigma instead of within sigma',
      'Accounts for process centering — it uses the worse of the two one-sided indices, CPU or CPL'
    ],
    answer: 3,
    why: 'Cpk = min(USL−μ, μ−LSL)/(3σ). If the process is off-center, Cpk < Cp. Cp = Cpk indicates a centered process.'
  },
  {
    q: 'Cp = 2.0 and the process k factor (relative mean position) = 0.25. Cpk equals:',
    options: [
      '1.75',
      '2.0',
      '1.0',
      '1.5'
    ],
    answer: 3,
    why: 'Cpk = Cp × (1 − k) = 2.0 × 0.75 = 1.5. The offset costs exactly that much capability.'
  },
  {
    q: 'Why must capability indices be computed only on a process in statistical control?',
    options: [
      'The calculation is too slow otherwise',
      'An unstable process has no single distribution — the index cannot describe any consistent process, let alone predict future output',
      'Cp requires subgroup ranges',
      'ISO forbids it for unstable processes'
    ],
    answer: 1,
    why: 'Cp/Cpk summarize one stable distribution. With special causes present, the "process" keeps changing shape and location, so the numbers mean nothing for the future.'
  },
  {
    q: 'Cp/Cpk use sigma estimated from WITHIN subgroups; Pp/Ppk use sigma estimated from the OVERALL dataset. Which pair is used to describe LONG-TERM (overall) performance?',
    options: [
      'R̄ and s̄',
      'Cp and Cpk',
      'Pp and Ppk',
      'Cp and Ppk'
    ],
    answer: 2,
    why: 'Short-term (within) capability → Cp/Cpk; long-term overall performance → Pp/Ppk. The difference reveals how much special-cause variation exists between subgroups.'
  },
  {
    q: 'A customer specification is one-sided (e.g., strength ≥ 2000 psi only). The appropriate capability index is:',
    options: [
      'Cpm',
      'Cpk requires both limits always',
      'Cp',
      'CPU only (one-sided Cpk)'
    ],
    answer: 3,
    why: 'With only a lower limit, capability = CPU = (μ − LSL)/(3σ). There is no upper spec to include.'
  },
  {
    q: 'Capability data fail the Anderson-Darling normality test (A² = 1.12, 5% critical = 0.752). The BEST action is:',
    options: [
      'Do not use normal-based indices directly — transform (e.g., Box-Cox) or use percentile/ISO 22514 non-normal capability',
      'Delete the extreme values until A² passes',
      'Switch to an attribute chart',
      'Report normal Cp/Cpk anyway'
    ],
    answer: 0,
    why: 'A² > critical rejects normality. Skewed or heavy-tailed data bias normal-based indices badly. Transform, use percentile capability, or report the actual tail percentages.'
  },
  {
    q: 'Your sample Cpk = 1.40, but its 95% confidence interval is [0.86, 1.94]. The customer requires Cpk ≥ 1.33. The BEST action is:',
    options: [
      'Claim compliance — the point estimate exceeds 1.33',
      'Collect more data — the lower confidence bound is below 1.33, so capability is not yet demonstrated',
      'Round up to 1.5',
      'Widen the specification'
    ],
    answer: 1,
    why: 'A wide interval means the true Cpk could plausibly be below the requirement. More data narrows the interval; then judge against the lower bound.'
  },
  {
    q: 'Cpk = 1.00 corresponds approximately to what fraction of output beyond the nearest specification limit (stable, normal, centered)?',
    options: [
      'Zero',
      'About 0.135% (1350 ppm)',
      'About 2.7%',
      'About 10%'
    ],
    answer: 1,
    why: 'Cpk = 1 puts the nearest spec at 3 sigma; ~0.135% falls beyond it. Cpk 1.33 ≈ 63 ppm; Cpk 1.67 ≈ 0.6 ppm beyond that side.'
  },
  {
    q: 'Six Sigma quality (with the conventional 1.5 sigma long-term shift) corresponds to approximately:',
    options: [
      '66,807 DPMO',
      '0 DPMO',
      '3.4 defects per million opportunities (DPMO)',
      '233 DPMO'
    ],
    answer: 2,
    why: 'The 1.5 shift allowance moves the long-term effective limit to 4.5 sigma → 3.4 DPMO. Without the shift, 6 sigma would be ~0.002 DPMO.'
  },
  {
    q: 'Which is the BEST description of the relationship between Cp and Cpk for a stable, centered process?',
    options: [
      'Cp equals Cpk when the process mean sits exactly at mid-tolerance',
      'Cp is always larger by exactly 0.33',
      'They are unrelated',
      'Cpk is always larger'
    ],
    answer: 0,
    why: 'With no centering offset (k = 0), the worst one-sided index equals Cp. Any shift makes Cpk smaller than Cp.'
  },
  {
    q: 'Management wants a quick "process capability" number from two days of production with obvious machine changeovers in the data. The BEST response is:',
    options: [
      'Compute Ppk on all the data as-is',
      'First stabilize the process (control the changeover special cause), then compute Cp/Cpk on the stable baseline',
      'Delete the changeover days',
      'Use Cp only — it ignores centering anyway'
    ],
    answer: 1,
    why: 'Capability requires stability. Quantify and control the changeover effect (e.g., rational subgroups, setup standardization) before any index has meaning.'
  },
  {
    q: 'For capability studies, a common customer requirement in automotive is Cpk ≥ 1.33. This level roughly means:',
    options: [
      'The process is Six Sigma',
      'The nearest spec is at least 4 sigma from the mean (allowing for centering and natural variation)',
      'Zero defects are possible',
      'Cp must equal 2.0'
    ],
    answer: 1,
    why: 'Cpk 1.33 puts the nearest spec about 4 sigma out (3 × 1.33 ≈ 4) — a widely used minimum for ongoing production. 1.67 is often demanded for safety/critical characteristics.'
  },
  {
    q: 'Continuous (variable) data are generally preferred over attribute data because they:',
    options: [
      'Never require sampling',
      'Do not need a measurement system',
      'Are cheaper to collect',
      'Provide more information per observation and greater statistical power to detect change'
    ],
    answer: 3,
    why: 'Every reading carries magnitude information; attribute data throw that away. With the same sample size, variable data detect shifts far faster.'
  },
  {
    q: 'The measurement scale of "temperature in °C" (equal intervals, arbitrary zero) is:',
    options: [
      'Ordinal',
      'Interval',
      'Ratio',
      'Nominal'
    ],
    answer: 1,
    why: 'Celsius has equal intervals but a non-absolute zero (0°C is not "no heat") → interval scale. Kelvin is ratio.'
  },
  {
    q: 'Hardness grades (soft, medium, hard) with no numeric distance between them represent which scale?',
    options: [
      'Nominal',
      'Ordinal',
      'Interval',
      'Ratio'
    ],
    answer: 1,
    why: 'Ordinal data can be ranked but not measured as differences — categories have order only.'
  },
  {
    q: 'The PRIMARY purpose of random sampling in data collection is to:',
    options: [
      'Satisfy CLT requirements',
      'Reduce the sample size',
      'Avoid selection bias so the sample represents the population',
      'Guarantee normal distribution'
    ],
    answer: 2,
    why: 'Randomness gives every item a known chance of selection, preventing systematic bias. No statistical technique can fix a biased sample.'
  },
  {
    q: 'On an OC (operating characteristic) curve, producer risk (α) is:',
    options: [
      'The producer\'s profit margin',
      'Type III error',
      'The probability of rejecting a good lot (e.g., at AQL)',
      'The probability of accepting a bad lot (e.g., at LTPD)'
    ],
    answer: 2,
    why: 'α = P(reject lot | lot quality = AQL). Consumer risk β = P(accept lot | lot quality = LTPD). The OC curve shows the full trade-off.'
  },
  {
    q: 'AQL (Acceptable Quality Level) is defined as:',
    options: [
      'The average quality of all lots ever shipped',
      'The maximum number of defects allowed forever',
      'A process capability index',
      'The worst quality the consumer will accept for ongoing delivery, used to define a "good" lot for sampling plans'
    ],
    answer: 3,
    why: 'AQL is the fraction defective (or ppm) considered acceptable for regular inspection; lots at or better than the AQL should be accepted ~95% of the time.'
  },
  {
    q: 'Increasing sample size in acceptance sampling will:',
    options: [
      'Make the OC curve flatter — reduce both α and β (better discrimination)',
      'Make the OC curve steeper',
      'Have no effect on risks',
      'Only affect LTPD'
    ],
    answer: 0,
    why: 'More data → better discrimination between good and bad lots — a steeper OC curve around the indifference region, with lower risks at the same AQL/LTPD points.'
  },
  {
    q: 'Gage R&R (repeatability and reproducibility) evaluates:',
    options: [
      'Control chart stability',
      'Whether the process is capable',
      'The measurement system\'s variation — repeatability (equipment) and reproducibility (appraisers)',
      'Supplier quality levels'
    ],
    answer: 2,
    why: 'Gage R&R partitions measurement variation into equipment variation (repeatability) and appraiser variation (reproducibility). A capable gauge is a prerequisite for valid SPC.'
  },
  {
    q: 'Industry-accepted Gage R&R criteria state %GRR < 10% is good, 10-30% is conditionally acceptable, and above 30% is:',
    options: [
      'Acceptable for safety characteristics',
      'A sign the process is incapable',
      'Excellent — accept immediately',
      'Unacceptable — improve the measurement system before using the data for SPC or capability'
    ],
    answer: 3,
    why: 'Above 30% GRR, measurement noise swamps process signal. Fix the gauge (resolution, method, fixturing, training) before charting or calculating Cp/Cpk.'
  },
  {
    q: 'A Gage R&R study reports ndc = 2 (number of distinct categories). This means:',
    options: [
      'Two operators were studied',
      'The study needs 2 more parts',
      'ndc below 5 is the goal',
      'The gauge can reliably distinguish only about two data categories across the part range'
    ],
    answer: 3,
    why: 'ndc < 5 means the measurement system cannot resolve part-to-part differences well enough for SPC or capability — the gauge blurs real variation into noise.'
  },
  {
    q: 'Measurement BIAS is defined as:',
    options: [
      'The difference between the observed average and a reference (true) value — accuracy',
      'Variation between different operators',
      'Variation of bias across the operating range',
      'Variation of bias over time'
    ],
    answer: 0,
    why: 'Bias = observed mean − reference value (accuracy). Linearity = bias change across the range; stability = bias change over time; repeatability = equipment variation; reproducibility = appraiser variation.'
  },
  {
    q: 'Calibration alone, without a Gage R&R study, is insufficient because calibration:',
    options: [
      'Is required only by ISO',
      'Checks accuracy against a standard but does not quantify the gauge\'s total measurement variation (repeatability and reproducibility)',
      'Costs too much',
      'Only works on variable gauges'
    ],
    answer: 1,
    why: 'Calibration addresses bias/accuracy at a point; Gage R&R quantifies the gauge\'s precision and operator effects across the range. SPC needs both.'
  },
  {
    q: 'The "10:1 rule" (or 4:1 in some industries) for gauge resolution states that:',
    options: [
      'Sample size must be 10× the subgroup size',
      'Control limits should span 10 units',
      'Ten operators should be used in a study',
      'The gauge\'s discrimination (smallest increment) should be no more than 10% of the tolerance (or process spread)'
    ],
    answer: 3,
    why: 'A gauge that cannot resolve differences smaller than ~10% of the tolerance (or 4:1 vs total variation) distorts SPC data with quantization noise.'
  },
  {
    q: 'Attribute agreement analysis (attribute MSA) is used to evaluate:',
    options: [
      'Variable gauge bias',
      'Process capability on go/no-go data only',
      'Control chart limits',
      'Whether human inspectors consistently classify product the same way across appraisers, trials, and standards'
    ],
    answer: 3,
    why: 'For visual/tactile go/no-go decisions, attribute agreement analysis measures within/between appraiser, within/between trial, and versus-standard agreement (kappa).'
  },
  {
    q: 'The Pareto chart is BEST used to:',
    options: [
      'Show all causes in equal rank order',
      'Rank causes by frequency or cost so the vital few stand out for focused improvement',
      'Display process capability',
      'Monitor a process over time'
    ],
    answer: 1,
    why: 'Pareto charts order categories from most to least frequent/costly — the classic tool for prioritizing the 80/20 vital few.'
  },
  {
    q: 'In a cause-and-effect (Ishikawa/fishbone) diagram, the main categories typically include:',
    options: [
      'Prevention, Appraisal, Internal failure, External failure',
      'Plan, Do, Check, Act',
      'Man, Machine, Material, Method, Measurement, and environment (6M)',
      'Input, Process, Output, Feedback'
    ],
    answer: 2,
    why: 'The 6M bones structure brainstorming of root causes. PDCA is the improvement cycle; POJF is the cost taxonomy.'
  },
  {
    q: 'In a Design FMEA, Risk Priority Number (RPN) is calculated as:',
    options: [
      'Severity × Probability of failure',
      'Cost × frequency × duration',
      'Severity × Occurrence × Detection',
      'Severity + Occurrence + Detection'
    ],
    answer: 2,
    why: 'RPN = S × O × D. High RPN (or high severity regardless of RPN) drives action. Note: AIAG-VDA 2019 replaced RPN with an Action Priority (AP) ranking.'
  },
  {
    q: 'The 5 Whys technique is primarily used to:',
    options: [
      'Drill through symptom levels to the root cause of a special cause or problem',
      'Set control limits',
      'Design experiments',
      'Count defects on a c chart'
    ],
    answer: 0,
    why: 'Repeated "why" questioning chases the causal chain to a fixable root cause. It works best with data and cross-functional knowledge, not as blind repetition.'
  },
  {
    q: 'The DMAIC improvement framework stands for:',
    options: [
      'Define, Measure, Analyze, Improve, Control',
      'Design, Manufacture, Audit, Inspect, Certify',
      'Define, Manage, Assess, Innovate, Control',
      'Detect, Measure, Analyze, Inspect, Correct'
    ],
    answer: 0,
    why: 'DMAIC is the Six Sigma roadmap for improving an existing process; DMADV (Define-Measure-Analyze-Design-Verify) covers designing new processes/products.'
  },
  {
    q: 'In the classic Juran Trilogy, quality improvement is one leg alongside:',
    options: [
      'Design and manufacturing',
      'Inspection and testing',
      'Quality planning and quality control',
      'Prevention and appraisal'
    ],
    answer: 2,
    why: 'Juran\'s Trilogy: Quality Planning (design the process), Quality Control (maintain it via SPC), Quality Improvement (break through to new performance levels).'
  },
  {
    q: 'Internal failure costs of poor quality include:',
    options: [
      'Calibration of gauges',
      'Vendor audits',
      'Warranty claims and returned product',
      'Scrap and rework found BEFORE shipping'
    ],
    answer: 3,
    why: 'Internal failure = defects found before delivery (scrap, rework, re-test). External failure = after delivery (warranty, returns, lost reputation). Prevention and appraisal are the other two COQ categories.'
  },
  {
    q: 'Spending MORE on which cost category is the strategically preferred investment?',
    options: [
      'Appraisal',
      'Internal failure',
      'External failure',
      'Prevention'
    ],
    answer: 3,
    why: 'Prevention (training, robust design, error-proofing, supplier development) reduces the other three categories far more cost-effectively — the core economics behind SPC adoption.'
  },
  {
    q: 'A first-party quality audit is one performed:',
    options: [
      'By the organization on itself (internal audit)',
      'By a customer on its supplier',
      'By an accredited third-party registrar',
      'By a regulatory agency'
    ],
    answer: 0,
    why: 'First-party = internal; second-party = customer on supplier; third-party = external certification body (e.g., ISO 9001 registrar).'
  },
  {
    q: 'The reliability "bathtub curve" shows failure rate over time with three phases:',
    options: [
      'Design, production, field',
      'Random, uniform, increasing',
      'Early infant mortality, useful life (constant random failures), wear-out',
      'Low, medium, high'
    ],
    answer: 2,
    why: 'High early failures (infant mortality), then a flat useful-life period dominated by random causes, then rising wear-out. Burn-in and preventive maintenance target these phases.'
  },
  {
    q: 'MTBF (Mean Time Between Failures) applies most appropriately to:',
    options: [
      'Attribute defect rates',
      'Control chart averages',
      'Repairable systems during their useful life',
      'Storage shelf life of consumables'
    ],
    answer: 2,
    why: 'MTBF describes average operating time between failures of repairable items. For non-repairable life data, MTTF/median life is used.'
  },
  {
    q: 'The primary purpose of a Control Plan (per IATF 16949 / APQP) is to:',
    options: [
      'Replace the PFMEA',
      'Define the marketing strategy',
      'Set employee performance goals',
      'Document how the process is monitored and controlled — characteristics, methods, sample sizes, reaction plans — to keep gains'
    ],
    answer: 3,
    why: 'The Control Plan links FMEA risks to SPC/inspection controls with reaction plans — the living document that keeps the improved process stable.'
  },
  {
    q: 'In SPC software or a manual chart, the FIRST action after a confirmed special-cause signal should be:',
    options: [
      'Recalculate the limits to include the point',
      'Find the cause, take corrective action, and verify the chart returns to control',
      'Stop the process permanently',
      'Increase the specification tolerance'
    ],
    answer: 1,
    why: 'Signal → investigate → fix → verify. Only after the cause is removed and stability returns should normal monitoring continue (and possibly re-baselining with justification).'
  },
  {
    q: 'Kaizen refers to:',
    options: [
      'A type of control chart',
      'A single large breakthrough project',
      'Continuous, incremental improvement involving the people who do the work',
      'A Japanese sampling standard'
    ],
    answer: 2,
    why: 'Kaizen = continuous small improvements by empowered teams — complementing SPC: chart signals prompt focused kaizen events on special causes and common-cause reduction.'
  },
  {
    q: 'QFD (Quality Function Deployment / House of Quality) is BEST used to:',
    options: [
      'Measure gauge repeatability',
      'Audit suppliers',
      'Translate customer requirements (the voice of the customer) into design and process characteristics',
      'Calculate control limits'
    ],
    answer: 2,
    why: 'QFD systematically deploys customer needs into engineering specifications and process controls — a front-end planning tool feeding FMEA and Control Plans.'
  },
  {
    q: 'Which statement BEST captures "statistical thinking"?',
    options: [
      'All data must be normally distributed',
      'Sampling is a waste of time',
      'If a point is within limits, the process needs no improvement',
      'Every variation has a cause; focus on the system that produces variation rather than isolated events'
    ],
    answer: 3,
    why: 'Statistical thinking views the organization as a system of interrelated processes; variation is produced by the system, and improvement means understanding and changing that system.'
  },
  {
    q: 'A colleague says, "Our chart is in control, so the process is perfect." The BEST SPC response is:',
    options: [
      'Agree — in control is the ultimate goal',
      'Clarify that in control means stable/predictable; the process may still be incapable or economically unsatisfactory — now attack common-cause variation',
      'Tell them to widen the limits',
      'Suggest they stop collecting data'
    ],
    answer: 1,
    why: 'Control ≠ ideal. It means the system is behaving predictably — the starting point for deliberate common-cause reduction, not the finish line.'
  },
  {
    q: 'Subgroups should be collected:',
    options: [
      'Only when problems are suspected',
      'As often as possible regardless of cost',
      'At a frequency that detects meaningful shifts within an acceptable time, balancing cost and detection speed',
      'Only once per week'
    ],
    answer: 2,
    why: 'Sampling frequency and size are economic trade-offs: more frequent/larger samples detect smaller shifts faster but cost more. Chart only when you can react.'
  },
  {
    q: 'When several machines or streams feed one chart and show mixture patterns, the BEST solution is:',
    options: [
      'Delete the outlying points',
      'Switch to an attribute chart',
      'Widen the control limits to cover all streams',
      'Stratify: chart each stream separately, or use rational subgroups containing one stream per subgroup'
    ],
    answer: 3,
    why: 'Mixing streams bloat the limits and hide each machine\'s true behavior. Separate charts (or stratified subgroups) reveal each stream\'s signals.'
  },
  {
    q: 'A process monitoring program succeeds when:',
    options: [
      'Charts drive defined actions: reaction plans for signals, and a feedback loop for common-cause improvement',
      'Cpk exceeds 2.0 at all times',
      'Zero points ever fall outside limits',
      'Charts are posted and everyone looks at them'
    ],
    answer: 0,
    why: 'A chart without a reaction plan is decoration. SPC works when signals trigger investigation and stable performance triggers deliberate improvement.'
  }
];
