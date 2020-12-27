using Example.ViewModel;
using System.Threading.Tasks;

namespace Example.Contract
{
    public interface IChatService
    {
        Task StartWorkAsync(StartWorkVm message);
    }
}
