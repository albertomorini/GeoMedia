SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[POST_MERGE]
    @POST_CONTENT NVARCHAR(MAX)
AS
BEGIN
    BEGIN TRANSACTION T1
    BEGIN TRY

          DECLARE @Result TABLE (
            ID INT
        );

        MERGE INTO POSTS AS T
        USING (
            SELECT 
                JJ.ID,
                JJ.AUTHOR_ID,
                JJ.TITLE,
                JJ.COMMENT,
                JJ.LATITUDE,
                JJ.LONGITUDE,
                JJ.ALTITUDE,
                JJ.EXCLUSIVITY,
                JJ.VISIBILITY_AREA_KM,
                DATE_EXL.DATE_START,
                DATE_EXL.DATE_END,
                JJ.VIEWERS,
                DATE_EXL.RECURRENT,
                JJ.COLLECTION_ID
            FROM OPENJSON(@POST_CONTENT,'$') WITH(
                ID INT,
                AUTHOR_ID INT,
                TITLE VARCHAR(50),
                COMMENT VARCHAR(MAX),
                LATITUDE FLOAT,
                LONGITUDE FLOAT,
                ALTITUDE FLOAT,
                VISIBILITY_AREA_KM FLOAT,
                COLLECTION_ID INT,
                EXCLUSIVITY NVARCHAR(MAX) AS JSON,
                viewers NVARCHAR(MAX) '$.EXCLUSIVITY.viewers' AS JSON 
            ) JJ OUTER APPLY OPENJSON(EXCLUSIVITY,'$.daterange')WITH(
                DATE_START DATETIME,
                DATE_END DATETIME,
                RECURRENT INT
            ) DATE_EXL
            WHERE TITLE IS NOT NULL

        ) AS S
        ON T.ID = S.ID

        WHEN MATCHED THEN
            UPDATE SET
                    T.TITLE = ISNULL(S.TITLE,T.TITLE),
                    T.COMMENT = ISNULL(S.COMMENT,T.COMMENT),
                    T.DM = GETDATE(),
                    T.LATITUDE = ISNULL(S.LATITUDE,T.LATITUDE),
                    T.LONGITUDE = ISNULL(S.LONGITUDE,T.LONGITUDE),
                    T.ALTITUDE = ISNULL(S.ALTITUDE,T.ALTITUDE),
                    T.VISIBILITY_AREA_KM = ISNULL(S.VISIBILITY_AREA_KM,T.VISIBILITY_AREA_KM),
                    T.EXCL_DATE_START = ISNULL(S.DATE_START,T.EXCL_DATE_START),
                    T.EXCL_DATE_END = ISNULL(S.DATE_END,T.EXCL_DATE_END),
                    T.VIEWERS = ISNULL(S.VIEWERS,T.VIEWERS),
                    T.RECURRENT = ISNULL(S.RECURRENT,T.RECURRENT),
                    T.COLLECTION_ID = ISNULL(S.COLLECTION_ID,T.COLLECTION_ID)



        WHEN NOT MATCHED THEN
            INSERT (
                AUTHOR_ID, TITLE, COMMENT, DC, DM,
                LATITUDE, LONGITUDE, ALTITUDE,
                VISIBILITY_AREA_KM,
                EXCL_DATE_START,
                EXCL_DATE_END,
                VIEWERS,RECURRENT,
                COLLECTION_ID
                
            )
            VALUES (
                 S.AUTHOR_ID, S.TITLE, S.COMMENT, GETDATE(), GETDATE(),
                S.LATITUDE, S.LONGITUDE, S.ALTITUDE,
                S.VISIBILITY_AREA_KM,
                S.DATE_START,
                S.DATE_END,
                S.VIEWERS,
                S.RECURRENT,
                S.COLLECTION_ID
            )

        OUTPUT inserted.ID
        INTO @Result;

        COMMIT TRANSACTION T1;
        SELECT ID AS ID, 1 AS OK FROM @Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION T1;
        PRINT ERROR_MESSAGE()
        SELECT -1 AS ID, 0 AS OK, ERROR_MESSAGE() AS MSG
    END CATCH
END;

GO
