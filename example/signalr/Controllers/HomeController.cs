using Example.Contract;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Example.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {

        private readonly IChatHubService _chatHubService;

        public HomeController(IChatHubService chatHubService)
        {
            _chatHubService = chatHubService;
        }

        [HttpGet("start")]
        public async Task<String> Start()
        {
            await _chatHubService.StartWorkAsync(new ViewModel.StartWorkVm()
            {
                BirthDate = DateTime.Now,
                FirstName = "Majid",
                LastName = "Bigdeli",
                JobType = Enums.JobType.Manager
            });
            return "started";

        }
        [HttpGet("stop")]
        public async Task Stop()
        {
            await _chatHubService.StopWork(new ViewModel.StopWorkVm()
            {
                Date = DateTime.Now,
                Description = "Majid"
            });

        }
    }
}
