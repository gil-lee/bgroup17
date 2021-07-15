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
    public class UserFilterController : ApiController
    {
        // GET api/<controller>

        [HttpGet]
        [Route("api/UserFilter/GetFilters")]
        public List<UserFilterDTO> GetFilters()
        {
            swishDBContext db = new swishDBContext();
            var userFilter = db.S_UserFilter.Select(x => new UserFilterDTO()
            {
                id = x.id,
                email = x.email,
                keyWord = x.keyWord,
                keyWordType = x.keyWordType,
                userToken = db.S_User_New.Where(y => y.email == x.email).Select(u => new UserNewDTO()
                {
                    userToken = u.userToken
                }).ToList()
            }).ToList();
            return userFilter;
        }

        [HttpGet]
        [Route("api/UserFilter/GetUserFilter/{email}/{keywordType}/{keyword}")]
        public List<UserFilterDTO> GetUserFilter(string email, string keywordType, string keyword)
        {
            swishDBContext db = new swishDBContext();
            var user = db.S_UserFilter.SingleOrDefault(x => x.email == email);
            if (user != null)
            {
                PutKeyWork(email, keywordType, keyword);
            }
            else
            {
                PostUserFilter(email, keywordType, keyword);
            }
         
            var userFilter = db.S_UserFilter.Select(x => new UserFilterDTO()
            {
                id = x.id,
                email = x.email,
                keyWord = x.keyWord,
                keyWordType = x.keyWordType,
                userToken= db.S_User_New.Where(y => y.email == email).Select(u => new UserNewDTO()
                {
                    userToken = u.userToken
                }).ToList()
                //userToken = db.S_User_New.Where(y => y.email == email).Select(u => u.userToken).ToString()
            }).ToList();

            return userFilter;
        }

        // POST api/<controller>
        [HttpPost]
        [Route("api/UserFilter/PostUserFilter/{email}/{keywordType}/{keyword}")]
        public HttpResponseMessage PostUserFilter(string email, string keywordType, string keyword)
        {
            swishDBContext db = new swishDBContext();

            S_UserFilter userF = new S_UserFilter();
            userF.email =email;
            userF.keyWord =keyword;
            userF.keyWordType = keywordType;
            
            try
            {
                db.S_UserFilter.Add(userF);
                db.SaveChanges();

            }
            catch (DbUpdateConcurrencyException ex) //שגיאה בדריסת ערך של שמירה מקבילית
            {
                return Request.CreateResponse(HttpStatusCode.Conflict, "נא לנסות שוב");
            }

            catch (Exception ex) //שגיאה כללית
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
            }
            return Request.CreateResponse(HttpStatusCode.OK, "רשומה נוספה בהצלחה");

        }

        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/UserFilter/PutKeyWork/{email}/{keywordType}/{keyword}")]
        public IHttpActionResult PutKeyWork(string email,string keywordType,  string keyword)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_UserFilter filter = db.S_UserFilter.SingleOrDefault(x => x.email == email);

                if (filter != null)
                {
                    filter.keyWordType = keywordType;
                    filter.keyWord = keyword;
                    db.SaveChanges();
                    return Ok(filter);
                }
                return Content(HttpStatusCode.NotFound, "לא נמצא משתמש כזה");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}