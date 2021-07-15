using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DATA;
using web_API.DTO;

namespace web_API.Controllers
{
    public class UserItemsController : ApiController 
    {


        // POST api/<controller>
        [Route("api/UserItems/{userEmail}/{idItem}")]
        public HttpResponseMessage Post(string userEmail, int idItem)
        {
           
            swishDBContext db = new swishDBContext();
            S_User_Items userItems = new S_User_Items();

            userItems.email = userEmail;
            userItems.itemId = idItem;
            userItems.uploadDate = DateTime.Today;
            userItems.itemStatus = "available";
            db.S_User_Items.Add(userItems);

            try
            {
                db.SaveChanges();

                UserNewController u = new UserNewController();
                u.AvatarPut(userEmail);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateResponse(HttpStatusCode.Conflict, "נא לנסות שוב, שמירה במקביל");
            }
            catch (Exception ex) //שגיאה כללית
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית");
            }
            return Request.CreateResponse(HttpStatusCode.OK, "העלאת פריט למשתמש בוצעה בהצלחה");
        }


        [HttpGet]
        [Route("api/UserItems/GetItems/{userEmail}/")] 
        public List<UserItemsDTO> GetItems(string userEmail)
        {
            swishDBContext db = new swishDBContext();
            var userItem = db.S_User_Items.Where(y => y.email != userEmail).Select(x => new UserItemsDTO()
            {
                id = x.id,
                email = x.email,
                itemId = (int)x.itemId,
                uploadDate = x.uploadDate,
                status= x.itemStatus
            }).ToList();

            return userItem;
        }


        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/UserItems/PutUserItemStatus/{itemId}/{status}")]
        public HttpResponseMessage PutUserItemStatus(int itemId, string status)
        {
            swishDBContext db = new swishDBContext();
            UserNewController u = new UserNewController();
            ItemNewController i = new ItemNewController();
            var userItem = db.S_User_Items.Where(y => y.itemId == itemId).FirstOrDefault();
            var user = db.S_User_New.Where(x => x.email == userItem.email).FirstOrDefault();
            var item = db.S_Item_New.Where(z => z.itemId == itemId).FirstOrDefault();

            try
            {
                if (userItem != null)
                {
                    try
                    {
                        if (status == "deleted")
                        {
                            userItem.itemStatus = "deleted";
                            db.SaveChanges();

                            if (user != null)
                            {
                                u.RemoveLevelAvPut(user.email);
                                db.SaveChanges();
                            }
                        }
                    }
                    catch (Exception)
                    {
                        return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית, שינוי סטטוס לנמחק");
                    }
                    try
                    {
                        if (status == "delivered")
                        {
                            userItem.itemStatus = "delivered";
                            db.SaveChanges();

                            //if (user != null)
                            //{
                            //    u.PutAddPointsUser(userItem.email, (int)item.numberOfPoints);
                            //    db.SaveChanges();
                            //}
                        }
                    }
                    catch (Exception)
                    {
                        return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית, שינוי סטטוס לנמסר");
                    }
                }
            }
            catch (Exception)
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית");
            }
            return Request.CreateResponse(HttpStatusCode.OK, "סטטוס הפריט עודכן בהצלחה");
        }
    }
}