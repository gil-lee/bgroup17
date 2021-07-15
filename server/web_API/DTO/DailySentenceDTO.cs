using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class DailySentenceDTO
    {
        public int id;
        public string sentence;
        public List<UserNewDTO> users;

        public int getSentence(List<DailySentenceDTO> dailySentence)
        {
            int[] tempArr= { };
            int counter = 0;
            foreach (var item in dailySentence)
            {
                tempArr[counter++] = item.id;
            }
            Random rnd = new Random(counter);
            int sentId = rnd.Next();

            return sentId;
        }
    }

    
}