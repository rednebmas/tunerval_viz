-- http://stackoverflow.com/questions/20973867/sqlite-multiple-aggregate-columns
SELECT [client>client_id],
       [device>platform>name],
    SUM(case when [metrics>interval] <> -22 then 1 else 0 end) as [total_questions_answered],

    SUM(case when [metrics>interval] = -12 then 1 else 0 end) as [desc octave],
    SUM(case when [metrics>interval] = -11 then 1 else 0 end) as [desc major seventh],
    SUM(case when [metrics>interval] = -10 then 1 else 0 end) as [desc minor seventh],
    SUM(case when [metrics>interval] = -9  then 1 else 0 end) as [desc major sixth],
    SUM(case when [metrics>interval] = -8  then 1 else 0 end) as [desc minor sixth],
    SUM(case when [metrics>interval] = -7  then 1 else 0 end) as [desc perfect fith],
    SUM(case when [metrics>interval] = -6  then 1 else 0 end) as [desc tritone],
    SUM(case when [metrics>interval] = -5  then 1 else 0 end) as [desc perfect fourth],
    SUM(case when [metrics>interval] = -4  then 1 else 0 end) as [desc major third],
    SUM(case when [metrics>interval] = -3  then 1 else 0 end) as [desc minor third],
    SUM(case when [metrics>interval] = -2  then 1 else 0 end) as [desc major second],
    SUM(case when [metrics>interval] = -1  then 1 else 0 end) as [desc minor second],

    SUM(case when [metrics>interval] =  0  then 1 else 0 end) as [unison],

    SUM(case when [metrics>interval] = 1  then 1 else 0 end) as [asc minor second],
    SUM(case when [metrics>interval] = 2  then 1 else 0 end) as [asc major second],
    SUM(case when [metrics>interval] = 3  then 1 else 0 end) as [asc minor third],
    SUM(case when [metrics>interval] = 4  then 1 else 0 end) as [asc major third],
    SUM(case when [metrics>interval] = 5  then 1 else 0 end) as [asc perfect fourth],
    SUM(case when [metrics>interval] = 6  then 1 else 0 end) as [asc tritone],
    SUM(case when [metrics>interval] = 7  then 1 else 0 end) as [asc perfect fith],
    SUM(case when [metrics>interval] = 8  then 1 else 0 end) as [asc minor sixth],
    SUM(case when [metrics>interval] = 9  then 1 else 0 end) as [asc major sixth],
    SUM(case when [metrics>interval] = 10 then 1 else 0 end) as [asc minor seventh],
    SUM(case when [metrics>interval] = 11 then 1 else 0 end) as [asc major seventh],
    SUM(case when [metrics>interval] = 12 then 1 else 0 end) as [asc octave]

FROM QuestionAnswers 
WHERE [event_timestamp] > ? AND [event_timestamp] < ?
GROUP BY [client>client_id];
