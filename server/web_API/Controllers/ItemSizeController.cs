using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DATA;
using web_API.DTO;

namespace web_API.Controllers
{
    public class ItemSizeController : ApiController //קונטרול האחראי על הבאת כל המידות הקיימות בDB
    {
        // GET api/<controller>
        public List<ItemSizeDTO> Get() //הבאת כלל המידות
        {
            swishDBContext db = new swishDBContext();
            var sizes = db.S_ItemSize.Select(x => new ItemSizeDTO()
            {
                id= x.id,
                size = x.size
            }).ToList();
            return sizes;
        }
          

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}