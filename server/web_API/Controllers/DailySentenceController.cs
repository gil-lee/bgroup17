using DATA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using web_API.DTO;

namespace web_API.Controllers
{
    public class DailySentenceController : ApiController
    {
        // GET api/<controller>
        public dynamic Get()
        {
            swishDBContext db = new swishDBContext();

            var sentences = db.S_DailySentence.Select(x => new DailySentenceDTO()
            {
                id = x.id,
                sentence = x.sentence
            }).ToList();

            int counter = sentences.Count;
            string[] tempArr = new string[counter];
            int c = 0;
            foreach (var sent in sentences)
            {
                tempArr[c++] = sent.sentence;
            }
            Random rnd = new Random();
            int number = rnd.Next(0, counter);
            return tempArr[number];
        }

    }
}