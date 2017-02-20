-- http://stackoverflow.com/questions/20973867/sqlite-multiple-aggregate-columns
SELECT [client>client_id],
    SUM(case when [metrics>interval] <> -22 then 1 else 0 end) as total_questions_answered,

    SUM(case when [metrics>interval] = -12 then 1 else 0 end) as desc_octave,
    SUM(case when [metrics>interval] = -11 then 1 else 0 end) as desc_maj_seventh,
    SUM(case when [metrics>interval] = -10 then 1 else 0 end) as desc_min_seventh,
    SUM(case when [metrics>interval] = -9  then 1 else 0 end) as desc_maj_sixth,
    SUM(case when [metrics>interval] = -8  then 1 else 0 end) as desc_min_sixth,
    SUM(case when [metrics>interval] = -7  then 1 else 0 end) as desc_perf_fith,
    SUM(case when [metrics>interval] = -6  then 1 else 0 end) as desc_tritone,
    SUM(case when [metrics>interval] = -5  then 1 else 0 end) as desc_perf_fourth,
    SUM(case when [metrics>interval] = -4  then 1 else 0 end) as desc_maj_third,
    SUM(case when [metrics>interval] = -3  then 1 else 0 end) as desc_min_third,
    SUM(case when [metrics>interval] = -2  then 1 else 0 end) as desc_maj_second,
    SUM(case when [metrics>interval] = -1  then 1 else 0 end) as desc_min_second,

    SUM(case when [metrics>interval] =  0  then 1 else 0 end) as unison,

    SUM(case when [metrics>interval] = 1  then 1 else 0 end) as asc_min_second,
    SUM(case when [metrics>interval] = 2  then 1 else 0 end) as asc_maj_second,
    SUM(case when [metrics>interval] = 3  then 1 else 0 end) as asc_min_third,
    SUM(case when [metrics>interval] = 4  then 1 else 0 end) as asc_maj_third,
    SUM(case when [metrics>interval] = 5  then 1 else 0 end) as asc_perf_fourth,
    SUM(case when [metrics>interval] = 6  then 1 else 0 end) as asc_tritone,
    SUM(case when [metrics>interval] = 7  then 1 else 0 end) as asc_perf_fith,
    SUM(case when [metrics>interval] = 8  then 1 else 0 end) as asc_min_sixth,
    SUM(case when [metrics>interval] = 9  then 1 else 0 end) as asc_maj_sixth,
    SUM(case when [metrics>interval] = 10 then 1 else 0 end) as asc_min_seventh,
    SUM(case when [metrics>interval] = 11 then 1 else 0 end) as asc_maj_seventh,
    SUM(case when [metrics>interval] = 12 then 1 else 0 end) as asc_octave

FROM QuestionAnswers 
WHERE [event_timestamp] > ? AND [event_timestamp] < ?
GROUP BY [client>client_id];
