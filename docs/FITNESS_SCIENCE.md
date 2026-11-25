# Evidence for fitness coaching

Reviewed 25 November 2026. This records the evidence and limits behind product decisions; it is not an individual medical or exercise prescription.

## Assisted-machine warm-ups

[PureGym's assisted pull-up instructions](https://www.puregym.com/exercises/back/pull-up/assisted-pull-ups/) explain that selecting more assistance makes the movement easier. A warm-up set calculated as a fraction below 100% of the working assistance can therefore be harder, not easier. Saved percentage blocks are not generated for assisted exercises; their data are retained, and a user can select a count-based ramp instead. The exact effective resistance cannot be inferred from the stack number without knowing the machine and user.

## Cardio and progression

The [WHO guidelines](https://iris.who.int/bitstream/handle/10665/336656/9789240015128-eng.pdf) advise inactive adults to begin with small amounts and gradually increase activity. Their 150–300 minutes of moderate activity per week and muscle-strengthening on at least two days are population recommendations, not automatic starting prescriptions. The [US Physical Activity Guidelines](https://odphp.health.gov/sites/default/files/2019-09/Physical_Activity_Guidelines_2nd_edition.pdf) advise initially inactive adults to increase duration and frequency before intensity, with progression suited to the person. Neither source validates a universal weekly percentage increase for this app.

The [CDC talk test](https://www.cdc.gov/physicalactivity/basics/measuring/index.html) describes moderate activity as allowing conversation but not singing, and vigorous activity as allowing only a few words before a breath. A [small treadmill and cycling study](https://pubmed.ncbi.nlm.nih.gov/15354048/) investigated its relationship to ventilatory thresholds. It is a practical indicator, not an individual diagnostic test or a substitute for symptoms and context.

Product implications are conservative design choices, not clinically validated predictions: compare only sufficiently similar activities and recorded conditions; never treat missing effort, recovery or wearable data as proof of readiness; make recommendations reviewable and avoid silently changing a plan. Outdoor walks can contribute to aerobic activity but do not automatically substitute for resistance training.

Manual walks can be recorded as activities and included in weekly walking and overall activity minutes. These are logged durations, not verified minutes of moderate or vigorous intensity; the app cannot establish the WHO target from duration alone. The existing recovery model receives no invented resistance-set equivalent for a walk with unknown intensity. This is missing information, not proof that the walk caused no fatigue or that the user is recovered. Automatic health-store walk import remains off.

The cardio comparison screen reports two measured average heart rates alongside the same recorded exercise, identified gym, duration, speed and the machine setting normally shown for that exercise. It requires two distinct completed single-block workouts with per-set heart-rate data; differently labelled brands and unknown displayed settings do not match. Any additional recorded incline or level must match too, but an unrecorded additional setting is unknown. Identical recorded settings do not prove identical physical machines, environmental conditions, measurement methods or effort. The readings are descriptive and do not establish an improvement in fitness or readiness. Existing data may not preserve an explicitly flat treadmill incline, so those records cannot be matched as known flat; interval workouts and automatic prescriptions remain outside this first comparison.

For context, a [study of day-to-day submaximal exercise heart rate](https://pubmed.ncbi.nlm.nih.gov/19387374/) investigated variation at different exercise intensities, and a [controlled exercise-in-heat study](https://pubmed.ncbi.nlm.nih.gov/31469711/) found differences in heart rate with and without fluid replacement. These studies support caution about interpreting a change; they do not validate this app's comparison as a fitness test.

## Strength effort

Repetitions in reserve are subjective estimates; one [study of their accuracy](https://pubmed.ncbi.nlm.nih.gov/29204323/) found imperfect prediction. A [small five-week randomised trial](https://pubmed.ncbi.nlm.nih.gov/37144554/) in trained adults did not find significant strength or hypertrophy differences between the studied near-failure and further-from-failure groups. These studies do not validate a universal readiness threshold or require every set to reach failure.

Cardio RPE describes perceived exertion and is not a count of repetitions left in reserve. The strength-effort summary and exercise chart exclude cardio sets from RIR calculations; an exercise-history row can still show its logged cardio RPE as RPE. Historical RPE fields can originate from imports and do not always identify the rating scale, so they cannot safely be converted retrospectively into CDC intensity categories. The pre-existing recovery model remains a heuristic and has not been clinically validated.

The app's initial cardio duration and speed are editable interface defaults, not individually established starting prescriptions. A [randomised trial of novice runners](https://pubmed.ncbi.nlm.nih.gov/17940147/) did not find that a 10% progression rule reduced injury compared with the trial's other programme; this does not establish that larger increases are safe either.

## Symptoms

[NHS exercise guidance](https://www.cuh.nhs.uk/patient-information/cardiac-rehabilitation-home-exercise-guidelines/) identifies symptoms that require stopping exercise in its cardiac rehabilitation context. [NHS heart attack guidance](https://www.nhs.uk/conditions/heart-attack/) distinguishes urgent symptoms and emergency action. Any future symptom messaging needs an appropriate scope and clinical review rather than treating every symptom as having the same urgency.
