package br.com.radarmottu.network;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Gerencia as instâncias do Retrofit para as diferentes APIs (Java e Python).
 */
public class RetrofitClients {

    private static final String JAVA_API_URL = "http://72.61.219.15:8080/";
    // CORRIGIDO: Apontando para a URL base correta do proxy Nginx.
    private static final String PYTHON_API_URL = "http://72.61.219.15/radarmotu-api/";

    private static ApiService javaApiService;
    private static PythonApiService pythonApiService;

    private static Retrofit getClient(String baseUrl) {
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .build();

        return new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }

    /**
     * Retorna a instância do serviço para a API Java (backend principal).
     */
    public static ApiService javaApi() {
        if (javaApiService == null) {
            javaApiService = getClient(JAVA_API_URL).create(ApiService.class);
        }
        return javaApiService;
    }

    /**
     * Retorna a instância do serviço para a API Python (sonar, radar 2D).
     */
    public static PythonApiService pythonApi() {
        if (pythonApiService == null) {
            pythonApiService = getClient(PYTHON_API_URL).create(PythonApiService.class);
        }
        return pythonApiService;
    }
}
