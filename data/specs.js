/* Model technical specs (buyer-oriented)
   Source: 58moto.com spec pages, one record per model; keys are "brand|model" and match dashboard.js.
   Scope: where a model has several trims, the one matching the official list price is used (latest model year, standard trim); variant records the actual trim.
   Fields not collected are omitted and render as an em dash，不做估算填充。 */
window.MOTO_SPECS = {
  meta: {
    asOf: "2026-11-19",
    source: "",
    sourceNote: "Spec sheets are not part of this edition",
    totalModels: 255
  },
  models: {}
};
