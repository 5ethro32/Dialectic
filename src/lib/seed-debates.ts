export interface JudgeVote {
  judge: 'empiricist' | 'logician' | 'contrarian' | 'pragmatist' | 'chief_justice';
  side: 'A' | 'B';
  reasoning: string;
}

export interface SeedDebate {
  slug: string;
  topic: string;
  category: string;
  sideA: {
    label: string;
    brief: string;
  };
  sideB: {
    label: string;
    brief: string;
  };
  votes: JudgeVote[];
  verdictSummary: string;
  status: 'decided' | 'deliberating';
  trending: boolean;
  daysAgo: number;
}

export const JUDGE_META: Record<string, { name: string; color: string; focus: string }> = {
  empiricist: { name: 'The Empiricist', color: '#3B82F6', focus: 'Evidence & Data' },
  logician: { name: 'The Logician', color: '#8B5CF6', focus: 'Logic & Structure' },
  contrarian: { name: 'The Contrarian', color: '#EF4444', focus: 'Robustness' },
  pragmatist: { name: 'The Pragmatist', color: '#F59E0B', focus: 'Practicality' },
  chief_justice: { name: 'Chief Justice', color: '#1B6B6D', focus: 'Synthesis' },
};

export const SEED_DEBATES: SeedDebate[] = [
  {
    slug: 'messi-vs-ronaldo',
    topic: 'Messi vs Ronaldo: Who is the Greatest of All Time?',
    category: 'Sports',
    sideA: {
      label: 'Messi',
      brief: 'Lionel Messi\'s case rests on unmatched creative genius, a record 8 Ballon d\'Ors, and a playing style that transcends statistics. His 2022 World Cup triumph completed the only missing piece in a career defined by playmaking artistry, vision, and consistency across 20+ years at the highest level. Advanced metrics like expected assists, progressive carries, and chance creation consistently place him in a category of one.',
    },
    sideB: {
      label: 'Ronaldo',
      brief: 'Cristiano Ronaldo represents the ultimate self-made athlete: a player who transformed himself through sheer willpower into the Champions League\'s all-time top scorer with 140 goals across multiple leagues. His 5 Champions League titles with two different clubs, 900+ career goals, and sustained dominance through his late 30s demonstrate an unrivaled combination of athleticism, mentality, and adaptability.',
    },
    votes: [
      { judge: 'empiricist', side: 'A', reasoning: 'Advanced metrics overwhelmingly favor Messi. His expected goals outperformance, chance creation numbers, and dribble completion rates are historically unprecedented. Ronaldo leads in raw goal tallies, but per-90 efficiency and holistic contribution metrics point clearly to Messi.' },
      { judge: 'logician', side: 'A', reasoning: 'The GOAT argument reduces to: who elevated team performance most consistently? Messi\'s Barcelona produced the most dominant club football ever recorded. The logical framework of \'most complete footballer\' — encompassing passing, dribbling, scoring, and vision — has fewer gaps for Messi.' },
      { judge: 'contrarian', side: 'B', reasoning: 'The Messi case relies heavily on Barcelona\'s system. Ronaldo proved himself across three top leagues and two national teams. His Champions League knockout record — scoring in every conceivable high-pressure moment — is a more robust test of greatness than thriving in one system.' },
      { judge: 'pragmatist', side: 'A', reasoning: 'If you\'re building a team from scratch, Messi\'s ability to function as playmaker, scorer, and creative engine gives more practical value. You can build around Messi; Ronaldo needs a system built for him.' },
      { judge: 'chief_justice', side: 'A', reasoning: 'While Ronaldo\'s longevity and cross-league dominance present a compelling case, the weight of statistical evidence, creative influence, and complete skill set tips the balance. The panel finds 3-2 in favor of Messi as the GOAT, while acknowledging Ronaldo as the greatest goal-scorer in history.' },
    ],
    verdictSummary: 'The panel rules 3-2 in favor of Messi. The Empiricist, Logician, and Pragmatist were persuaded by advanced metrics and holistic contribution, while the Contrarian valued Ronaldo\'s multi-league adaptability. The Chief Justice synthesized that while both are all-time greats, Messi\'s creative completeness edges out Ronaldo\'s prolific scoring.',
    status: 'decided',
    trending: true,
    daysAgo: 1,
  },
  {
    slug: 'should-ai-be-regulated',
    topic: 'Should AI Development Be Regulated by Governments?',
    category: 'Technology',
    sideA: {
      label: 'Yes, regulate',
      brief: 'Artificial intelligence poses existential-scale risks that the market cannot self-correct. History shows that every transformative technology — nuclear energy, genetic engineering, financial instruments — required regulatory frameworks to prevent catastrophic misuse. AI systems are already being deployed in hiring, criminal justice, and healthcare with documented bias. Without binding regulation, competitive pressure will drive a race to the bottom on safety.',
    },
    sideB: {
      label: 'No, let it develop',
      brief: 'Government regulation of a rapidly evolving technology will inevitably lag behind innovation, creating compliance theater rather than genuine safety. The EU AI Act already shows this: broad categorizations that stifle research while failing to address actual harms. Industry self-regulation, open-source transparency, and market competition are faster, more adaptive mechanisms. Regulation also consolidates power among incumbents who can afford compliance, killing the startup ecosystem.',
    },
    votes: [
      { judge: 'empiricist', side: 'A', reasoning: 'Documented cases of AI bias in COMPAS sentencing, Amazon hiring tools, and healthcare allocation algorithms show real harm occurring now. Studies from MIT and Stanford demonstrate that voluntary safety commitments have not reduced deployment of biased systems. The evidence supports intervention.' },
      { judge: 'logician', side: 'A', reasoning: 'The structure of the AI market creates a prisoner\'s dilemma: each company is individually incentivized to cut safety corners if competitors do. Only an external enforcement mechanism can resolve this coordination failure. The logical case for regulation is sound even if implementation details are debatable.' },
      { judge: 'contrarian', side: 'B', reasoning: 'Regulation assumes regulators understand the technology — they demonstrably do not. The EU AI Act classifies \'emotion recognition\' as high-risk while leaving autonomous weapons to separate legislation. Poorly designed regulation creates false confidence and redirects engineering effort from actual safety work to paperwork.' },
      { judge: 'pragmatist', side: 'A', reasoning: 'The practical reality is that some regulation is coming regardless. The question is whether it\'s well-designed or reactive. Proactive frameworks like risk-tiered regulation give industry clarity while protecting the public. Waiting for catastrophe before acting is not a pragmatic strategy.' },
      { judge: 'chief_justice', side: 'A', reasoning: 'The panel finds 4-1 in favor of regulation. The coordination failure argument is decisive — voluntary commitments cannot overcome competitive incentives. However, the Contrarian\'s warning about regulatory competence must inform the design: regulation should be principles-based, not prescriptive, and developed in close collaboration with technical experts.' },
    ],
    verdictSummary: 'The panel rules 4-1 in favor of AI regulation. The empirical evidence of existing harms, the logical coordination failure in competitive markets, and the pragmatic inevitability of regulation all point the same direction. The lone dissent raises valid concerns about regulatory competence that should shape — but not prevent — oversight.',
    status: 'decided',
    trending: true,
    daysAgo: 2,
  },
  {
    slug: 'remote-vs-office',
    topic: 'Remote Work vs Office: Which Produces Better Outcomes?',
    category: 'Work',
    sideA: {
      label: 'Remote',
      brief: 'Remote work eliminates commute time (averaging 54 minutes/day in the US), enables deep focus, and gives workers autonomy that correlates with higher job satisfaction. Studies from Stanford and Microsoft show that remote workers are equally or more productive for individual tasks. The talent pool expands globally, costs drop, and employees report better work-life balance. The office is an artifact of pre-internet coordination needs.',
    },
    sideB: {
      label: 'Office',
      brief: 'Offices enable spontaneous collaboration, faster feedback loops, and the kind of ambient awareness that prevents silos. Microsoft\'s own research shows remote work weakened cross-team connections. Junior employees learn through osmosis and mentorship that video calls cannot replicate. Culture, trust, and innovation suffer in fully distributed teams — which is why even tech companies are mandating return-to-office.',
    },
    votes: [
      { judge: 'empiricist', side: 'A', reasoning: 'The productivity data is mixed, but satisfaction, retention, and cost metrics clearly favor remote. Blind\'s survey of 3,000 tech workers showed 64% would take a pay cut for permanent remote. The Stanford study found 13% productivity gains. Office advocates cite collaboration metrics but these are harder to quantify.' },
      { judge: 'logician', side: 'B', reasoning: 'The remote productivity argument conflates individual output with organizational effectiveness. A team can have individually productive members who collectively underperform due to coordination costs, knowledge silos, and communication lag. The logical unit of analysis should be the team, not the individual.' },
      { judge: 'contrarian', side: 'A', reasoning: 'The return-to-office push is driven by real estate sunk costs and management insecurity, not evidence. Companies mandating RTO are seeing their best talent leave. The \'spontaneous collaboration\' argument is romanticism — most office time is spent in scheduled meetings and headphone-wearing focused work anyway.' },
      { judge: 'pragmatist', side: 'B', reasoning: 'In practice, hybrid is winning because pure remote creates real problems for onboarding, culture, and rapid iteration. The pragmatic answer isn\'t either extreme — it\'s structured flexibility. But if forced to choose, the office provides a higher floor even if remote offers a higher ceiling.' },
      { judge: 'chief_justice', side: 'A', reasoning: 'The panel splits 3-2 in favor of remote work. Individual productivity and employee wellbeing data support remote, while organizational dynamics and mentorship concerns support office. The deciding factor: remote work\'s benefits are structural and compounding, while office benefits can be partially replicated through intentional remote practices.' },
    ],
    verdictSummary: 'The panel rules 3-2 for remote work. Individual productivity data and worker satisfaction make a strong empirical case. However, the Logician and Pragmatist raise valid concerns about team-level effectiveness and onboarding that prevent a stronger consensus. The ideal is likely hybrid, but remote takes the verdict as the better default.',
    status: 'decided',
    trending: true,
    daysAgo: 3,
  },
  {
    slug: 'anthropic-vs-openai',
    topic: 'Anthropic vs OpenAI: Who Is Building AI More Responsibly?',
    category: 'Technology',
    sideA: {
      label: 'Anthropic',
      brief: 'Anthropic was founded specifically to pursue AI safety research, publishing Constitutional AI, conducting systematic red-teaming, and implementing a Responsible Scaling Policy with concrete capability thresholds that trigger safety measures. Their research on mechanistic interpretability represents some of the most rigorous work on understanding what happens inside neural networks. They\'ve consistently prioritized safety research publication over product announcements.',
    },
    sideB: {
      label: 'OpenAI',
      brief: 'OpenAI\'s iterative deployment strategy has given society time to adapt to increasingly capable AI through GPT-3, ChatGPT, and GPT-4. By making AI accessible to millions, they\'ve democratized the technology and created a broad base of informed users and regulators. Their safety team published foundational alignment work, and their decision to deploy publicly — rather than keeping capabilities secret — enables collective scrutiny that closed development cannot.',
    },
    votes: [
      { judge: 'empiricist', side: 'A', reasoning: 'Anthropic publishes more safety research per capita. Their mechanistic interpretability work is peer-reviewed and cited. OpenAI\'s safety team has seen high-profile departures and their published safety research has declined relative to capability announcements. The empirical publication record favors Anthropic.' },
      { judge: 'logician', side: 'A', reasoning: 'Anthropic\'s structure — a Public Benefit Corporation with a Long-Term Benefit Trust — provides stronger logical guarantees against profit-driven safety compromises than OpenAI\'s complex capped-profit structure, which has already been tested and modified under commercial pressure.' },
      { judge: 'contrarian', side: 'B', reasoning: 'Anthropic\'s safety reputation is partly marketing. They deploy commercial products competitively just like OpenAI. Meanwhile, OpenAI\'s decision to make GPT-4 publicly available created more external safety research than any number of internal papers. Real safety comes from broad deployment and scrutiny, not from claiming the moral high ground while competing for the same customers.' },
      { judge: 'pragmatist', side: 'A', reasoning: 'In practice, Anthropic\'s Responsible Scaling Policy provides a concrete, auditable framework with defined triggers. OpenAI\'s safety commitments have been less formalized and more subject to change. From a practical governance standpoint, Anthropic\'s approach is more implementable.' },
      { judge: 'chief_justice', side: 'A', reasoning: 'The panel rules 3-2 recognizing that both companies contribute meaningfully to AI safety. Anthropic\'s structural commitments and research output edge out OpenAI\'s deployment-based approach. However, the Contrarian rightly notes that the distinction is narrower than partisans claim — both are commercial AI companies navigating the same tensions.' },
    ],
    verdictSummary: 'The panel rules 3-2 for Anthropic. Structural governance, research publication rates, and formalized scaling policies create a stronger safety case. The dissent correctly observes that both companies are commercial competitors making similar products, and that OpenAI\'s broad deployment has its own safety benefits through public scrutiny.',
    status: 'decided',
    trending: false,
    daysAgo: 5,
  },
  {
    slug: 'social-media-net-negative',
    topic: 'Is Social Media a Net Negative for Society?',
    category: 'Society',
    sideA: {
      label: 'Net negative',
      brief: 'Social media platforms are engineered for engagement, not wellbeing. Jonathan Haidt\'s research documents rising teen anxiety and depression correlating with smartphone adoption. Political polarization has intensified as algorithms amplify outrage. Misinformation spreads six times faster than truth on Twitter. Attention spans are fragmenting, public discourse is degrading, and the mental health costs — particularly for adolescents — represent a generational crisis.',
    },
    sideB: {
      label: 'Net positive',
      brief: 'Social media has democratized information, given voice to marginalized communities, and enabled organizing from the Arab Spring to #MeToo. Small businesses reach customers without advertising budgets. Researchers collaborate globally. Diaspora communities stay connected. The negative studies cherry-pick adolescent outcomes while ignoring billions of adults who use these tools productively. Correlation between social media and teen depression doesn\'t establish causation.',
    },
    votes: [
      { judge: 'empiricist', side: 'A', reasoning: 'Meta\'s own internal research found Instagram makes body image issues worse for 1 in 3 teen girls. The Surgeon General\'s advisory, multiple longitudinal studies, and natural experiments in countries where social media was restricted all point toward negative mental health effects. The correlation-causation objection is weakening as evidence accumulates.' },
      { judge: 'logician', side: 'A', reasoning: 'The argument structure matters: Side B\'s examples (Arab Spring, #MeToo) are specific events, while Side A identifies systemic mechanisms (engagement algorithms, dopamine loops). Systemic harms that affect billions daily outweigh episodic benefits in a logical cost-benefit framework.' },
      { judge: 'contrarian', side: 'B', reasoning: 'Every communication technology — the printing press, radio, television — was blamed for social decline. The current panic has the same structure. Social media\'s harms are real but overstated by a media ecosystem that itself depends on manufacturing outrage about social media. Selection bias in the research is significant.' },
      { judge: 'pragmatist', side: 'A', reasoning: 'Regardless of the academic debate, the practical effects are visible: news organizations gutted, attention fragmented, political discourse debased. Even if social media is theoretically neutral, the specific implementations by profit-maximizing companies have produced net negative outcomes for public life.' },
      { judge: 'chief_justice', side: 'A', reasoning: 'The panel finds 4-1 that social media, as currently implemented, is a net negative. The distinction matters: social networking as a concept has clear value, but the attention-economy business model has produced platforms optimized against user wellbeing. The Contrarian\'s historical perspective is noted but insufficient to override the accumulating evidence.' },
    ],
    verdictSummary: 'The panel rules 4-1 that social media is a net negative for society as currently implemented. The evidence on mental health, polarization, and misinformation is strong and growing. The lone dissent argues historical pattern-matching and selection bias, but the majority finds that algorithmic engagement optimization has produced systemic harms that outweigh the genuine benefits of digital connection.',
    status: 'decided',
    trending: false,
    daysAgo: 7,
  },
  {
    slug: 'crypto-replace-banking',
    topic: 'Will Cryptocurrency Replace Traditional Banking?',
    category: 'Finance',
    sideA: {
      label: 'Yes, it will',
      brief: 'Cryptocurrency eliminates rent-seeking intermediaries, enables borderless transactions, and provides financial access to 1.7 billion unbanked adults worldwide. DeFi protocols already offer lending, borrowing, and trading without banks. Stablecoins process more transaction volume than PayPal. As CBDCs legitimize digital currency and Gen Z grows up with crypto wallets, traditional banking will be disrupted the same way streaming disrupted cable.',
    },
    sideB: {
      label: 'No, it won\'t',
      brief: 'After 15 years, cryptocurrency\'s primary use case remains speculation. The technology is slow, volatile, and environmentally costly. FTX, Terra/Luna, and countless rug-pulls demonstrate that removing institutional safeguards removes consumer protection. Banks provide deposit insurance, fraud protection, mortgage underwriting, and economic stability through central bank coordination. DeFi replicates banking services worse, not better.',
    },
    votes: [
      { judge: 'empiricist', side: 'B', reasoning: 'After 15 years, crypto adoption for actual payments remains negligible. El Salvador\'s Bitcoin experiment saw 88% of businesses report zero Bitcoin transactions. Stablecoin volume is largely wash trading. The empirical evidence shows crypto as a speculative asset class, not a banking replacement.' },
      { judge: 'logician', side: 'B', reasoning: 'The argument confuses \"can\" with \"will.\" Decentralized ledgers can theoretically replace banks, but the logical requirements for mass adoption — stability, reversibility, consumer protection, regulatory compliance — push any practical implementation toward centralization, recreating banks with extra steps.' },
      { judge: 'contrarian', side: 'A', reasoning: 'The critics are evaluating crypto on a 15-year timeline against 400-year-old institutions. The internet looked like a toy in 1995. Stablecoin remittances are already cheaper and faster than Western Union for cross-border transfers. Dismissing the technology based on current speculation ignores the infrastructure being built underneath.' },
      { judge: 'pragmatist', side: 'B', reasoning: 'Practically, people want their bank to reverse fraudulent charges, insure deposits, and provide predictable mortgage rates. Crypto offers none of this reliably. The unbanked need simple, stable financial tools — not volatile assets requiring technical sophistication to self-custody safely.' },
      { judge: 'chief_justice', side: 'B', reasoning: 'The panel rules 4-1 against replacement. Cryptocurrency introduces valuable innovations in programmable money and borderless transfers, but the core functions of banking — stability, consumer protection, credit creation — require institutional structures that decentralization actively undermines. Crypto will complement banking, not replace it.' },
    ],
    verdictSummary: 'The panel rules 4-1 that cryptocurrency will not replace traditional banking. Fifteen years of data show minimal adoption for actual payments. The fundamental requirements of a banking system — stability, protection, credit creation — structurally conflict with decentralization. The Contrarian notes the technology is still young and cross-border payments show genuine promise, but the consensus is that crypto will augment, not replace, traditional finance.',
    status: 'decided',
    trending: false,
    daysAgo: 10,
  },
];

export function getDebateBySlug(slug: string): SeedDebate | undefined {
  return SEED_DEBATES.find(d => d.slug === slug);
}

export function getScore(debate: SeedDebate): { a: number; b: number } {
  const a = debate.votes.filter(v => v.side === 'A').length;
  return { a, b: 5 - a };
}

export function getWinningSide(debate: SeedDebate): 'A' | 'B' {
  const { a } = getScore(debate);
  return a >= 3 ? 'A' : 'B';
}
