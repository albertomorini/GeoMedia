
ALTER PROCEDURE [dbo].[USERS_LIST]
@JSON NVARCHAR(MAX)=NULL
AS
BEGIN
	SELECT ID AS UID , USERNAME,NAME,SURNAME, PROFILE_PICTURE FROM USERS
	WHERE EMAIL_VERIFIED=1
	--AND ID<>  JSON_VALUE(@JSON,'$.uid') --- commented on 8 may, since a post/collection can be visibile only by creator itself
END;