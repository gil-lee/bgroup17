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
    public class ItemStyleController : ApiController //קונטרולר האחראי על הבאת כל הסגנונות הקיימים בDB
    {
        // GET api/<controller>
        public List<ItemStyleDTO> Get() //הבאת כל הסגנונות
        {
            swishDBContext db = new swishDBContext();
            var styles = db.S_ItemStyle.Select(x => new ItemStyleDTO()
            {
                id= x.id,
                style = x.style
            }).ToList();
            return styles;
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