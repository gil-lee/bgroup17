using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using DATA;
using web_API.DTO;

namespace web_API.Controllers
{
    //[RoutePrefix("api/ItemNew")]
    public class ItemNewController : ApiController //קונטרולר האחראי על הבאת כל הפריטים הקיימים בDB 
    {
        // GET api/<controller>
        public List<ItemNewDTO> Get() //הבאת כלל הפריטים מהDB
        {
            swishDBContext db = new swishDBContext();
            var item = db.S_Item_New.Select(x => new ItemNewDTO()
            {
                itemId = x.itemId,
                name = x.name,
                description = x.description,
                image1 = x.image1,
                image2 = x.image2,
                image3 = x.image3,
                image4 = x.image4,
                numberOfPoints= (int)x.numberOfPoints,
                sizeId = (int)x.sizeId,
                typeId = (int)x.typeId,
                styleId = (int)x.styleId,
                conditionId = (int)x.conditionId,
                longitude= x.longitude,
                latitude= x.latitude
            }).ToList();

            return item;
        }
        [HttpGet]
        [Route("api/ItemNew/GetItemsList/{itemId}")]
        public List<ItemNewDTO> GetItemsList(int itemId) 
        {
            swishDBContext db = new swishDBContext();

            var item = db.S_Item_New.Where(y => y.itemId == itemId).Select(x => new ItemNewDTO()
            {
                itemId = x.itemId,
                name = x.name,
                description = x.description,
                image1 = x.image1,
                image2 = x.image2,
                image3 = x.image3,
                image4 = x.image4,
                numberOfPoints = (int)x.numberOfPoints,
                sizeId = (int)x.sizeId,
                typeId = (int)x.typeId,
                styleId = (int)x.styleId,
                conditionId = (int)x.conditionId
            }).ToList();

            return item;
        }
        

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]
        [Route ("api/ItemNew/Post/{userEmail}/")]
        public HttpResponseMessage Post(ItemNewDTO itemDTO, string userEmail) //יצירת פריט חדש בDB
        {
            swishDBContext db = new swishDBContext();
            S_Item_New item = new S_Item_New();

            item.itemId = itemDTO.itemId;
            item.name = itemDTO.name;
            item.description = itemDTO.description;
            item.image1 = itemDTO.image1;
            item.image2 = itemDTO.image2;
            item.image3 = itemDTO.image3;
            item.image4 = itemDTO.image4;
            item.sizeId = itemDTO.sizeId;
            item.typeId = itemDTO.typeId;
            item.styleId = itemDTO.styleId;
            item.conditionId = itemDTO.conditionId;
            item.latitude = itemDTO.latitude;
            item.longitude = itemDTO.longitude;

            S_ItemPrice itemPrice = db.S_ItemPrice.Single(x => x.id == itemDTO.typeId);
            S_ConditionPrices conditionPrice = db.S_ConditionPrices.Single(x => x.id == itemDTO.conditionId);
            item.numberOfPoints = itemPrice.price - conditionPrice.reduction; //עדכון המחיר של הפריט לפי סוג ומצב

            db.S_Item_New.Add(item);

            try
            {
                db.SaveChanges();

                UserItemsController ui = new UserItemsController();
                ui.Post(userEmail, item.itemId);

            }
            catch (DbUpdateConcurrencyException ex) //שגיאה בדריסת ערך של שמירה מקבילית
            {
                return Request.CreateResponse(HttpStatusCode.Conflict, "נא לנסות שוב");
            }

            catch (Exception ex) // שגיאה כללית 
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
            }
            return Request.CreateResponse(HttpStatusCode.OK, "פריט נוסף בהצלחה");
        }

        //public HttpResponseMessage Post(ItemNewDTO itemDTO) //יצירת פריט חדש בDB
        //{
        //    swishDBContext db = new swishDBContext();
        //    S_Item_New item = new S_Item_New();

        //    item.itemId = itemDTO.itemId;
        //    item.name = itemDTO.name;
        //    item.description = itemDTO.description;
        //    item.image1 = itemDTO.image1;
        //    item.image2 = itemDTO.image2;
        //    item.image3 = itemDTO.image3;
        //    item.image4 = itemDTO.image4;
        //    item.sizeId = itemDTO.sizeId;
        //    item.typeId = itemDTO.typeId;
        //    item.styleId = itemDTO.styleId;
        //    item.conditionId = itemDTO.conditionId;

        //    S_ItemPrice itemPrice = db.S_ItemPrice.Single(x => x.id == itemDTO.typeId);
        //    S_ConditionPrices conditionPrice = db.S_ConditionPrices.Single(x => x.id == itemDTO.conditionId);
        //    item.numberOfPoints = itemPrice.price - conditionPrice.reduction; //עדכון המחיר של הפריט לפי סוג ומצב

        //    db.S_Item_New.Add(item);

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException ex) //שגיאה בדריסת ערך של שמירה מקבילית
        //    {
        //        return Request.CreateResponse(HttpStatusCode.Conflict, "נא לנסות שוב");
        //    }

        //    catch (Exception ex) // שגיאה כללית 
        //    {
        //        return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
        //    }
        //    return Request.CreateResponse(HttpStatusCode.OK, "פריט נוסף בהצלחה");
        //}
        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/ItemNew/PutEditItem/{itemId}")]
        public HttpResponseMessage PutEditItem([FromBody] ItemNewDTO item, int itemId)
        {
            swishDBContext db = new swishDBContext();
            S_Item_New editItem = db.S_Item_New.SingleOrDefault(x => x.itemId == itemId);

            if (editItem != null)
            {
                editItem.name = item.name;
                editItem.description = item.description;
                editItem.sizeId = item.sizeId;
                editItem.typeId = item.typeId;
                editItem.styleId = item.styleId;
                editItem.conditionId = item.conditionId;

                S_ItemPrice itemPrice = db.S_ItemPrice.Single(x => x.id == item.typeId);
                S_ConditionPrices conditionPrice = db.S_ConditionPrices.Single(x => x.id == item.conditionId);
                editItem.numberOfPoints = itemPrice.price - conditionPrice.reduction; //עדכון המחיר של הפריט לפי סוג ומצב

                try
                {
                    db.SaveChanges();
                }
                catch (Exception ex) // שגיאה כללית 
                {
                    return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
                }
            }
            return Request.CreateResponse(HttpStatusCode.OK, "פריט עודכן בהצלחה");
        }
        

        // DELETE api/<controller>/5
        public void Delete(int id)
        {

        }
              
        
        [HttpPost]
        [Route("api/ItemNew/uploadItems/PostItemImage")]
        public Task<HttpResponseMessage> PostItemImage()//uploadItems //העלאת תמונות הפריטים לשרת לתיקייה:
        {
            string output = "start-";
            List<string> savedFilePath = new List<string>();
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            //Where to put the picture on server  ...MapPath("~/TargetDir")
            string rootPath = HttpContext.Current.Server.MapPath("~/uploadItemUser");
            var provider = new MultipartFileStreamProvider(rootPath);
            var task = Request.Content.ReadAsMultipartAsync(provider).
                ContinueWith<HttpResponseMessage>(t =>
                {
                    if (t.IsCanceled || t.IsFaulted)
                    {
                        Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                        //    Request.CreateErrorResponse(HttpStatusCode.UnsupportedMediaType,"if 1");
                    }
                    foreach (MultipartFileData item in provider.FileData)
                    {
                        try
                        {
                            output += " -here";
                            string name = item.Headers.ContentDisposition.FileName.Replace("\"", "");
                            output += " -here2" + name;

                            //need the guid because in react native in order to refresh an inamge it has to have a new name
                            string newFileName = Path.GetFileNameWithoutExtension(name) + "_" + CreateDateTimeWithValidChars() + Path.GetExtension(name);
                            //string newFileName = Path.GetFileNameWithoutExtension(name) + "_" + Guid.NewGuid() + Path.GetExtension(name);
                            //string newFileName = name + "" + Guid.NewGuid();
                            output += " -here3" + newFileName;

                            //delete all files begining with the same name
                            string[] names = Directory.GetFiles(rootPath);
                            foreach (var fileName in names)
                            {
                                if (Path.GetFileNameWithoutExtension(fileName).IndexOf(Path.GetFileNameWithoutExtension(name)) != -1)
                                {
                                    File.Delete(fileName);
                                }
                            }

                            //File.Move(item.LocalFileName, Path.Combine(rootPath, newFileName));
                            File.Copy(item.LocalFileName, Path.Combine(rootPath, newFileName), true);
                            File.Delete(item.LocalFileName);
                            output += " -here4";

                            Uri baseuri = new Uri(Request.RequestUri.AbsoluteUri.Replace(Request.RequestUri.PathAndQuery, string.Empty));
                            output += " -here5";
                            string fileRelativePath = "~/uploadItemUser/" + newFileName;
                            output += " -here6 imageName=" + fileRelativePath;
                            Uri fileFullPath = new Uri(baseuri, VirtualPathUtility.ToAbsolute(fileRelativePath));
                            output += " -here7" + fileFullPath.ToString();
                            savedFilePath.Add(fileFullPath.ToString());
                        }
                        catch (Exception ex)
                        {
                            output += " -excption=" + ex.Message;
                            string message = ex.Message;
                        }
                    }

                    return Request.CreateResponse(HttpStatusCode.Created, "swish " + savedFilePath[0] + "!" + provider.FileData.Count + "!" + output);
                });
            return task;
        }
        private string CreateDateTimeWithValidChars()
        {
            return DateTime.Now.ToString().Replace('/', '_').Replace(':', '-').Replace(' ', '_');
        }
    }
}